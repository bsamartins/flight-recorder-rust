
use sea_orm::{ActiveModelTrait, DatabaseConnection, DbErr, EntityTrait, IntoActiveModel};
use crate::database::entities::{flights::Model as FlightEntity, prelude::Flights};

pub struct FlightRepository {}

impl FlightRepository {
    pub async fn save(db: &DatabaseConnection, flight: FlightEntity) -> Result<FlightEntity, DbErr> {
        let x = flight.into_active_model().insert(db)
        .await?;
        return Ok(x.into());
    }

    pub async fn find_all(db: &DatabaseConnection) -> Result<Vec<FlightEntity>, DbErr> {
        let flights = Flights::find()
        .all(db)
        .await?;
        return Ok(flights);
    }

}
