
use sea_orm::{ActiveModelTrait, DatabaseConnection, DbErr, IntoActiveModel};
use crate::entities::flights::Model as FlightEntity;

pub struct FlightRepository {}

impl FlightRepository {    
    pub async fn save(db: &DatabaseConnection, flight: FlightEntity) -> Result<FlightEntity, DbErr> {        
        let x = flight.into_active_model().insert(db)
        .await?;
        return Ok(x.into());
    }
}