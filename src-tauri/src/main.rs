// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use state::FlightState;
use std::error::Error;
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
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
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

fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    tracing_subscriber::fmt().init();
    let database_path = app
        .path()
        .app_local_data_dir()
        .unwrap()
        .join("data.sqlite")
        .display()
        .to_string();    
    
    let handle = app.app_handle();

    futures::executor::block_on(async {
        let db_result = database::connection::initialize(&database_path).await;
        match db_result {
            Ok(db) => {
                handle.manage(db);
            }
            Err(e) => {
                tracing::error!("Failed to initalize database: {}", e);
            }        
        }
    });    
    Ok(())    
}
