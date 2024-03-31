use std::sync::Mutex;

use crate::model::Flight;

#[derive(Default)]
pub struct FlightState {
    pub flights: Mutex<Vec<Flight>>,
}
