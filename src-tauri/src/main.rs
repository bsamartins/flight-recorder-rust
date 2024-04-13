// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{error::Error};
use std::sync::Arc;
use std::thread::spawn;

use futures::lock::Mutex;
use tauri::{App, Manager};
use tracing::Level;
use tracing_subscriber;

use flight_instrumentation::FlightInstrumentation;
use state::FlightState;

mod cmd;
mod database;
mod flight_instrumentation;
mod model;
mod repositories;
mod state;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    tracing_subscriber::fmt()
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
    initialize_database(app);

    spawn(|| {
        let mut flight_instrumentation = FlightInstrumentation::new();
        let _ = flight_instrumentation
            .start();
    });

    Ok(())
}

fn initialize_database(app: &mut App) {
    let database_path = app
        .path()
        .app_local_data_dir()
        .unwrap()
        .join("data.sqlite")
        .display()
        .to_string();

    let handle = Arc::new(Mutex::new(app.app_handle()));

    futures::executor::block_on(async {
        let db = database::connection::initialize(&database_path).await
            .expect("Failed to initialise database");

        let guard = handle.lock().await;
        guard.clone().manage(db);
    });
}
