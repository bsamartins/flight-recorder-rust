use std::borrow::Borrow;

use crate::model::Flight;
use crate::repositories::flight_repository::FlightRepository;
use crate::state::FlightState;
use futures::TryFutureExt;
use sea_orm::prelude::Uuid;
use sea_orm::DatabaseConnection;
use tauri::State;
use crate::entities::flights::Model as FlightEntity;

#[tauri::command]
pub async fn create_flight<'s>(db_connection: State<'s, DatabaseConnection>) -> Result<Flight, String> {
    let flight = FlightRepository::save(
        db_connection.borrow(),
        FlightEntity {
            id: Uuid::new_v4().to_string(),
            departure: "LPPT".to_string(), 
            arrival: "LPPR".to_string(),
            aircraft: "Fenix A320".to_string(),
        }
    )
    .map_err(|err| err.to_string())
    .await?;
    Ok(Flight { 
        id: flight.id, 
        departure: Some(flight.departure), 
        arrival: Some(flight.arrival), 
        aircraft: flight.aircraft, 
    })
}

#[tauri::command]
pub fn list_flights(flight_state: State<FlightState>) -> Vec<Flight> {
    return <Vec<Flight> as Clone>::clone(&flight_state.flights.lock().unwrap());
}
