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

use instrumentation::flight_instrumentation::FlightInstrumentationV2;
use instrumentation::flight_recorder::FlightRecorder;
use state::FlightState;

mod cmd;
mod database;
mod instrumentation;
mod model;
mod repositories;
mod state;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let filter = EnvFilter::from_default_env()
        .add_directive("sqlx::query=error".parse()?);

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_max_level(Level::INFO)
        .init();

    let _ = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(setup)
        .manage(<FlightState as Default>::default())
        .invoke_handler(tauri::generate_handler![
            cmd::list_flights,
            cmd::create_flight,
            cmd::is_flight_in_progress,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}

fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    let _db = setup_database(app)?;

    let _ = tauri::async_runtime::spawn(async {
        let flight_instrumentation_result = setup_instrumentation().await;
        let flight_instrumentation = match flight_instrumentation_result {
            Ok(res) => { res }
            Err(err) => {
                tracing::error!("Failed to initialize {}", err);
                return;
            }
        };

        let result = setup_recorder(flight_instrumentation).await;
        match result {
            Ok(_) => {}
            Err(err) => tracing::error!("Failed to initialize {}", err)
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

async fn setup_instrumentation() -> Result<FlightInstrumentationV2, String> {
    tracing::info!("Setting up instrumentation");
    let mut flight_instrumentation = FlightInstrumentationV2::new();

    tracing::info!("Starting instrumentation");
    let _ = flight_instrumentation.start();

    tracing::info!("Done");
    Ok(flight_instrumentation.into())
}

async fn setup_recorder(flight_instrumentation: FlightInstrumentationV2) -> Result<(), String> {
    tracing::info!("Setting up recorder");
    let flight_recorder_res = FlightRecorder::new().await;
    let flight_recorder = match flight_recorder_res {
        Ok(fr) => { fr }
        Err(err) => return Err(format!("Failed to initialise flight recorder {err}"))
    };
    let _ = flight_recorder.start(flight_instrumentation).await;
    Ok(())
}