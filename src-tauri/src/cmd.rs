use std::borrow::Borrow;

use crate::model::Flight;
use crate::repositories::flight_repository::FlightRepository;
use chrono::Utc;
use futures::TryFutureExt;
use sea_orm::prelude::Uuid;
use sea_orm::{DatabaseConnection, DbErr};
use tauri::State;
use crate::database::entities::flights::Model as FlightEntity;

#[tauri::command]
pub async fn create_flight<'s>(db_connection: State<'s, DatabaseConnection>) -> Result<Flight, String> {
    let flight = FlightRepository::save(
        db_connection.borrow(),
        FlightEntity {
            id: Uuid::new_v4().to_string(),
            departure: Option::None,
            arrival: Option::None,
            aircraft: "Fenix A320".to_string(),
            start_timestamp: Utc::now(),
            end_timestamp: Option::None
        }
    )
    .map_err(map_db_error)
    .await?;
    Ok(flight.to_model())
}

#[tauri::command]
pub async fn list_flights<'s>(db_connection: State<'s, DatabaseConnection>) -> Result<Vec<Flight>, String> {
    let flights = FlightRepository::find_all(&db_connection)
    .map_err(map_db_error)
    .await?;
    return Ok(flights.into_iter()
        .map(|flight| flight.to_model())
        .collect())
}

impl FlightEntity {
    fn to_model(&self) -> Flight {
        return Flight {
            id: self.id.to_string(),
            departure: self.departure.clone(),
            arrival: self.arrival.clone(),
            aircraft: self.aircraft.to_string(),
        }
    }
}

fn map_db_error(db_err: DbErr) -> String {
    tracing::error!("Request failure: {}", db_err);
    return db_err.to_string()
}
