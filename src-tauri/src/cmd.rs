use std::sync::Arc;

use crate::database::entities::flights::Model as FlightEntity;
use crate::model::{ErrorModel, Flight};
use crate::repositories::flight_repository::FlightRepository;
use crate::state::FlightState;
use chrono::Utc;
use futures::TryFutureExt;
use sea_orm::prelude::Uuid;
use sea_orm::{DatabaseConnection, DbErr};
use tauri::State;

#[tauri::command]
pub async fn create_flight<'s>(
    db_connection: State<'s, DatabaseConnection>,
) -> Result<Flight, ErrorModel> {
    if FlightRepository::flight_in_progress(&db_connection)
        .map_err(map_db_error)
        .await?
    {
        return Err(ErrorModel::new(-1, "Flight in progress".to_string()));
    }
    let flight = FlightRepository::save(
        &db_connection,
        FlightEntity {
            id: Uuid::new_v4().to_string(),
            departure: Option::None,
            arrival: Option::None,
            aircraft: Option::None,
            aircraft_model: Option::None,
            start_timestamp: Utc::now(),
            end_timestamp: Option::None,
        },
    )
    .map_err(map_db_error)
    .await?;
    Ok(flight.to_model())
}

#[tauri::command]
pub async fn list_flights<'s>(
    db_connection: State<'s, DatabaseConnection>,
) -> Result<Vec<Flight>, ErrorModel> {
    let flights = FlightRepository::find_all(&db_connection)
        .map_err(map_db_error)
        .await?;
    return Ok(flights
        .into_iter()
        .map(|flight| flight.to_model())
        .collect());
}

#[tauri::command]
pub async fn is_flight_in_progress<'s>(db_connection: State<'s, DatabaseConnection>) -> Result<bool, ErrorModel> {    
    return Ok(
        FlightRepository::flight_in_progress(&db_connection)
            .map_err(map_db_error)
            .await?
    );
}

#[tauri::command]
pub fn is_instrumentation_connected(state: State<Arc<FlightState>>) -> bool {
    state.is_instrumentation_connected()
}

impl FlightEntity {
    fn to_model(&self) -> Flight {
        return Flight {
            id: self.id.to_string(),
            departure: self.departure.clone(),
            arrival: self.arrival.clone(),
            aircraft: self.aircraft.clone(),
            aircraft_model: self.aircraft_model.clone(),
        };
    }
}

fn map_db_error(db_err: DbErr) -> ErrorModel {
    tracing::error!("Request failure: {}", db_err);
    return ErrorModel::new(-1, db_err.to_string());
}
