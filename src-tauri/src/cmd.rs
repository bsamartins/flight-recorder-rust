use crate::model::Flight;
use crate::state::FlightState;
use tauri::State;

#[tauri::command]
pub fn create_flight(flight_state: &State<FlightState>) {
    let next_id = flight_state.flights.lock().unwrap().iter().count().to_string();
    flight_state.add_flight(
        Flight {
            id: next_id,
            departure: Some("EIDW".to_string()),
            arrival: Some("LPPT".to_string()),
            aircraft: "A320".to_string(),
        }
    );
}

#[tauri::command]
pub fn list_flights(flight_state: State<FlightState>) -> Vec<Flight> {
    return <Vec<Flight> as Clone>::clone(&flight_state.flights.lock().unwrap());
}
