use crate::database::entities::{
    flight_data, flight_data::Column as FlightDataColumns, flight_data::Model as FlightDataEntity,
    flights::Column as FlightColumns, flights::Model as FlightEntity, prelude::Flight, prelude::FlightData,
};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, IntoActiveModel, QueryFilter, QueryOrder};

#[derive(Clone)]
pub struct FlightRepository {
    db: DatabaseConnection,
}

impl FlightRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn save(&self, flight: FlightEntity) -> Result<FlightEntity, DbErr> {
        let x = flight.into_active_model().insert(&self.db).await?;
        return Ok(x.into());
    }

    pub async fn find_all(&self) -> Result<Vec<FlightEntity>, DbErr> {
        let flights = Flight::find().all(&self.db).await?;
        return Ok(flights);
    }

    pub async fn flight_in_progress(&self) -> Result<bool, DbErr> {
        let result = Flight::find()
            .filter(FlightColumns::EndTimestamp.is_null())
            .one(&self.db)
            .await?
            .map(|_| true)
            .unwrap_or(false);
        Ok(result)
    }

    pub async fn get_flight_in_progress(&self) -> Result<Option<FlightEntity>, DbErr> {
        Flight::find()
            .filter(FlightColumns::EndTimestamp.is_null())
            .one(&self.db)
            .await
    }

    pub async fn update_aircraft_and_model(
        &self,
        flight_id: &str,
        aircraft: &str,
        aircraft_model: &str,
    ) -> Result<(), DbErr> {
        if let Some(flight) = Flight::find_by_id(flight_id.to_string()).one(&self.db).await? {
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
                active_flight.update(&self.db).await?;
            }
        }
        Ok(())
    }

    pub async fn end_flight(&self, flight_id: &str) -> Result<Option<FlightEntity>, DbErr> {
        if let Some(flight) = Flight::find_by_id(flight_id.to_string()).one(&self.db).await? {
            if flight.end_timestamp.is_none() {
                let mut active_flight = flight.into_active_model();
                active_flight.end_timestamp = sea_orm::Set(Some(Utc::now()));
                let result = active_flight.update(&self.db).await?;
                return Ok(Some(result));
            }
        }
        Ok(None)
    }

    pub async fn save_flight_data(&self, data: flight_data::ActiveModel) -> Result<FlightDataEntity, DbErr> {
        data.into_active_model().insert(&self.db).await
    }

    pub async fn get_flight_data(&self, flight_id: &str) -> Result<Vec<FlightDataEntity>, DbErr> {
        FlightData::find()
            .filter(FlightDataColumns::FlightId.eq(flight_id))
            .order_by_asc(FlightDataColumns::Timestamp)
            .all(&self.db)
            .await
    }
}