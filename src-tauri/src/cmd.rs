use serde::Serialize;
use ts_rs::TS;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn list_flights() -> Vec<Flight> {
    return Vec::new()
}

#[derive(Serialize, TS, PartialEq, Eq, Hash)]
#[ts(export, export_to = "../src/bindings", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Flight {
    departure: String,
    arrival: String,
    aircraft: String
}
