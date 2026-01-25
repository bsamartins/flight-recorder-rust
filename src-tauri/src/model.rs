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
