use futures::StreamExt;
use crate::model::Flight;
use crate::state::FlightState;
use tauri::State;

#[tauri::command]
pub fn list_flights(flight_state: State<FlightState>) -> Vec<Flight> {
    return  <Vec<Flight> as Clone>::clone(&flight_state.flights);
}
