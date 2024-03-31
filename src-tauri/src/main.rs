// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::error::Error;
use state::FlightState;
use tauri::Manager;
use tracing_subscriber;

mod cmd;
mod state;
mod model;
mod flight_instrumentation;
mod database;
mod repositories;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    tauri::Builder::default()
        .setup(setup)
        .manage(<FlightState as Default>::default())
        .invoke_handler(tauri::generate_handler![
            cmd::list_flights,
            cmd::create_flight,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    tracing_subscriber::fmt().init();
    let app_handle = app.app_handle();
    tauri::async_runtime::spawn(async move {
        let database_path = app_handle.path_resolver().app_local_data_dir().unwrap()
            .join("data.sqlite")
            .display()
            .to_string();
        let db_result = database::connection::initialize(&database_path).await;
        match db_result {
            Ok(db) => {
                app_handle.manage(db);
            }
            Err(e) => {
                tracing::error!("Failed to initalize database: {}", e);
            }
        }
    });
    Ok(())
}
