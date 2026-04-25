use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, TS, PartialEq, Eq, Hash, Clone)]
#[ts(export, export_to = "../../src/bindings/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Flight {
    pub id: String,
    pub departure: Option<String>,
    pub arrival: Option<String>,
    pub aircraft: Option<String>,
    pub aircraft_model: Option<String>,
    pub start: String,
    pub end: Option<String>,
}

#[derive(Serialize, TS, Clone)]
#[ts(export, export_to = "../../src/bindings/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct FlightData {
    pub latitude: f64,
    pub longitude: f64,
    pub heading: f64,
    pub altitude: f64,
    pub altitude_above_ground: f64,
    pub ground_altitude: f64,
    pub indicated_airspeed: f64,
    pub true_airspeed: f64,
    pub ground_speed: f64,
    pub vertical_speed: Option<f64>,
    pub pitch: Option<f64>,
    pub bank: Option<f64>,
    pub fuel_total_quantity: Option<f64>,
    pub fuel_total_quantity_weight: Option<f64>,
    pub flaps_handle_index: Option<i32>,
    pub timestamp: String,
}

#[derive(Serialize, TS, PartialEq, Eq, Hash, Clone)]
#[ts(export, export_to = "../../src/bindings/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ErrorModel {
    pub code: i32,
    pub message: String,
}

impl ErrorModel {
    pub fn new(code: i32, message: String) -> ErrorModel {
        return ErrorModel {
            code: code,
            message: message,
        };
    }
}
