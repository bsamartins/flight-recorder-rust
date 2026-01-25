// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::error::Error;
use std::sync::Arc;

use futures::lock::Mutex;
use sea_orm::DatabaseConnection;
use tauri::{App, Manager};
use tracing::Level;
use tracing_subscriber;
use tracing_subscriber::EnvFilter;

use instrumentation::flight_instrumentation::FlightInstrumentation;
use instrumentation::flight_recorder::FlightRecorder;
use state::FlightState;
use crate::repositories::flight_repository::FlightRepository;

mod cmd;
mod database;
mod instrumentation;
mod model;
mod repositories;
mod state;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let filter = EnvFilter::from_default_env();
        // .add_directive("sqlx::query=error".parse()?);

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_max_level(Level::INFO)
        .init();

    let _ = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(setup)
        .manage(Arc::new(<FlightState as Default>::default()))
        .invoke_handler(tauri::generate_handler![
            cmd::list_flights,
            cmd::create_flight,
            cmd::is_flight_in_progress,
            cmd::is_instrumentation_connected,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}

fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    tracing::info!("Setting up database");
    let db = setup_database(app)?;
    tracing::info!("Database setup complete");

    let app_handle = app.app_handle().clone();

    let flight_state = app.state::<Arc<FlightState>>().inner().clone();
    let db_clone = (*db).clone();
    let flight_repository = FlightRepository::new(db_clone);
    app_handle.manage(flight_repository.clone());
    
    let _ = tauri::async_runtime::spawn(async move {
        tracing::info!("Starting instrumentation");
        let flight_instrumentation_result = setup_instrumentation().await;
        match flight_instrumentation_result {
            Ok(res) => {
                flight_state.set_instrumentation_connected(true);
                tracing::info!("Instrumentation started");
                tracing::info!("Starting recorder");
                let result = setup_recorder(res, flight_repository, app_handle).await;
                match result {
                    Ok(_) => {}
                    Err(err) => tracing::error!("Failed to initialize {}", err)
                }
            }
            Err(err) => {
                flight_state.set_instrumentation_connected(false);
                tracing::error!("Failed to initialize {}", err);
                return;
            }
        }
    });
    Ok(())
}

fn setup_database(app: &mut App) -> Result<Arc<DatabaseConnection>, Box<dyn Error>> {
    let database_path = app
        .path()
        .app_local_data_dir()
        .unwrap()
        .join("data.sqlite")
        .display()
        .to_string();

    let handle = Arc::new(Mutex::new(app.app_handle()));

    return futures::executor::block_on(async {
        let db = database::connection::initialize(&database_path).await?;
        let guard = handle.lock().await;
        guard.clone().manage(db.clone());
        Ok(Arc::new(db.clone()))
    });
}

async fn setup_instrumentation() -> Result<FlightInstrumentation, String> {
    tracing::info!("Setting up instrumentation");
    let mut flight_instrumentation = FlightInstrumentation::new();

    tracing::info!("Starting instrumentation");
    let _ = flight_instrumentation.start();

    tracing::info!("Done");
    Ok(flight_instrumentation.into())
}

async fn setup_recorder(flight_instrumentation: FlightInstrumentation, flight_repository: FlightRepository, app_handle: tauri::AppHandle) -> Result<(), String> {
    tracing::info!("Setting up recorder");
    let flight_recorder_res = FlightRecorder::new().await;
    let flight_recorder = match flight_recorder_res {
        Ok(fr) => { fr }
        Err(err) => return Err(format!("Failed to initialise flight recorder {err}"))
    };
    let _ = flight_recorder.start(flight_instrumentation, flight_repository, app_handle).await;
    Ok(())
}