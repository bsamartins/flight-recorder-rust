use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, TS, PartialEq, Eq, Hash, Clone)]
#[ts(export, export_to = "../../src/bindings/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct Flight {
    pub id: String,
    pub departure: Option<String>,
    pub arrival: Option<String>,
    pub aircraft: String,
}
