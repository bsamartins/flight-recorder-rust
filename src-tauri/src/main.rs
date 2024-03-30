// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::error::Error;
use crate::state::FlightState;

mod cmd;
mod state;
mod model;
mod flight_instrumentation;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
fn main() {
    tauri::Builder::default()
        .setup(setup)
        .manage(<FlightState  as Default>::default())
        .invoke_handler(tauri::generate_handler![
            cmd::list_flights,
            cmd::create_flight,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    println!("{}", app.path_resolver().app_data_dir().unwrap().to_string_lossy());
    println!("{}", app.path_resolver().app_local_data_dir().unwrap().to_string_lossy());
    Ok(())
}
