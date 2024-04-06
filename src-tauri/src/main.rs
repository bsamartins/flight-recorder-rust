// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use flight_instrumentation::FlightInstrumentation;
use futures::FutureExt;
use state::FlightState;
use tracing::Level;
use std::{borrow::Borrow, error::Error, sync::{Arc, Mutex}};
use tauri::{App, Manager};
use tracing_subscriber;

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
    let database_path = app
        .path()
        .app_local_data_dir()
        .unwrap()
        .join("data.sqlite")
        .display()
        .to_string();

    let handle = Arc::new(Mutex::new(app.app_handle()));
    
    tauri::async_runtime::spawn(async move {
        let mut flight_instrumentation = FlightInstrumentation::new();        
        flight_instrumentation.start().await;
    });

    futures::executor::block_on(async {
        let db_result = database::connection::initialize(&database_path).await;
        match db_result {
            Ok(db) => {
                let guard = handle.lock();
                *guard
                handle.manage(db);
            }
            Err(e) => {
                tracing::error!("Failed to initalize database: {}", e);
            }
        }
    });
    Ok(())
}
