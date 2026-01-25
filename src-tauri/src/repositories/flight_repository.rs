use crate::database::entities::{
    flights::Column as FlightColumns, flights::Model as FlightEntity, prelude::Flights,
};
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

    pub async fn update_aircraft(
        db: &DatabaseConnection,
        flight_id: &str,
        aircraft: &str,
    ) -> Result<(), DbErr> {
        if let Some(flight) = Flights::find_by_id(flight_id.to_string()).one(db).await? {
            if flight.aircraft.is_none() {
                let mut active_flight = flight.into_active_model();
                active_flight.aircraft = sea_orm::Set(Some(aircraft.to_string()));
                active_flight.update(db).await?;
            }
        }
        Ok(())
    }
}
