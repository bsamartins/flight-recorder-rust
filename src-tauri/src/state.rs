use crate::model::Flight;
use std::sync::Mutex;

#[derive(Default)]
pub struct FlightState {
    pub flights: Mutex<Vec<Flight>>,
}

impl FlightState {
    pub fn add_flight(self, flight: Flight) {
        self.flights.lock().unwrap().push(flight);
    }
}
