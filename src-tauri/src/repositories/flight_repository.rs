use crate::database::entities::{
    flights::Column as FlightColumns, flights::Model as FlightEntity, prelude::Flights,
};
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, IntoActiveModel,
    QueryFilter,
};

pub struct FlightRepository {}

impl FlightRepository {
    pub async fn save(
        db: &DatabaseConnection,
        flight: FlightEntity,
    ) -> Result<FlightEntity, DbErr> {
        let x = flight.into_active_model().insert(db).await?;
        return Ok(x.into());
    }

    pub async fn find_all(db: &DatabaseConnection) -> Result<Vec<FlightEntity>, DbErr> {
        let flights = Flights::find().all(db).await?;
        return Ok(flights);
    }

    pub async fn flight_in_progress(db: &DatabaseConnection) -> Result<bool, DbErr> {
        let result = Flights::find()
            .filter(FlightColumns::EndTimestamp.is_null())
            .one(db)
            .await?
            .map(|_| true)
            .unwrap_or(false);
        Ok(result)
    }

    pub async fn get_flight_in_progress(db: &DatabaseConnection) -> Result<Option<FlightEntity>, DbErr> {
        Flights::find()
            .filter(FlightColumns::EndTimestamp.is_null())
            .one(db)
            .await
    }

    pub async fn update_aircraft_and_model(
        db: &DatabaseConnection,
        flight_id: &str,
        aircraft: &str,
        aircraft_model: &str,
    ) -> Result<(), DbErr> {
        if let Some(flight) = Flights::find_by_id(flight_id.to_string()).one(db).await? {
            let need_aircraft_update = flight.aircraft.is_none();
            let need_model_update = flight.aircraft_model.is_none();

            if need_aircraft_update || need_model_update {
                let mut active_flight = flight.into_active_model();
                if need_aircraft_update {
                    active_flight.aircraft = sea_orm::Set(Some(aircraft.to_string()));
                }
                if need_model_update {
                    active_flight.aircraft_model = sea_orm::Set(Some(aircraft_model.to_string()));
                }
                active_flight.update(db).await?;
            }
        }
        Ok(())
    }

    pub async fn end_flight(db: &DatabaseConnection, flight_id: &str) -> Result<(), DbErr> {
        if let Some(flight) = Flights::find_by_id(flight_id.to_string()).one(db).await? {
            if flight.end_timestamp.is_none() {
                let mut active_flight = flight.into_active_model();
                active_flight.end_timestamp = sea_orm::Set(Some(Utc::now()));
                active_flight.update(db).await?;
            }
        }
        Ok(())
    }
}
