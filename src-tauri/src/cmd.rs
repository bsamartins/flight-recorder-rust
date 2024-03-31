use std::borrow::Borrow;

use crate::model::Flight;
use crate::repositories::flight_repository::FlightRepository;
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
    Ok(flight.to_model())
}

#[tauri::command]
pub async fn list_flights<'s>(db_connection: State<'s, DatabaseConnection>) -> Result<Vec<Flight>, String> {
    let flights = FlightRepository::find_all(&db_connection)
    .map_err(|err| err.to_string())
    .await?;
    return Ok(flights.into_iter()
        .map(|flight| flight.to_model())
        .collect())
}

impl FlightEntity {
    fn to_model(&self) -> Flight {
        return Flight { 
            id: self.id.to_string(), 
            departure: Some(self.departure.to_string()), 
            arrival: Some(self.arrival.to_string()), 
            aircraft: self.aircraft.to_string(), 
        }
    }
}
