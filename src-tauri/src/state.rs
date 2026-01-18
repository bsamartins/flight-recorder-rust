use std::sync::Mutex;

use crate::model::Flight;

#[derive(Default)]
pub struct FlightState {
    pub flights: Mutex<Vec<Flight>>,
    pub instrumentation_connected: Mutex<bool>,
}

impl FlightState {
    pub fn set_instrumentation_connected(&self, connected: bool) {
        let mut status = self.instrumentation_connected.lock().unwrap();
        *status = connected;
    }
    pub fn is_instrumentation_connected(&self) -> bool {
        let status = self.instrumentation_connected.lock().unwrap();
        *status
    }
}
