use serde::Serialize;
use ts_rs::TS;

#[tauri::command]
pub fn list_flights() -> Vec<Flight> {
    return Vec::from([
        Flight {
            departure: "LPPT".to_string(),
            arrival: "LPPR".to_string(),
            aircraft: "Fenix".to_string()
        }
    ]);
}

#[derive(Serialize, TS, PartialEq, Eq, Hash)]
#[ts(export, export_to = "../../src/bindings/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Flight {
    departure: String,
    arrival: String,
    aircraft: String
}
