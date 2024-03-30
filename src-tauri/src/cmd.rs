use serde::Serialize;
use serde_json::to_string;
use ts_rs::TS;

#[tauri::command]
pub fn list_flights() -> Vec<Flight> {
    return Vec::from([
        Flight {
            id: "1".to_string() ,
            departure: Some("LPPT".to_string()),
            arrival: Some("LPPR".to_string()),
            aircraft: "Fenix".to_string(),
        },
        Flight {
            id: "2".to_string() ,
            departure: Some("LPPR".to_string()),
            arrival: Some("LPFR".to_string()),
            aircraft: "Fenix".to_string(),
        },
    ]);
}

#[derive(Serialize, TS, PartialEq, Eq, Hash)]
#[ts(export, export_to = "../../src/bindings/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Flight {
    id: String,
    departure: Option<String>,
    arrival: Option<String>,
    aircraft: String,
}
