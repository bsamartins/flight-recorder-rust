
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, IntoActiveModel, QueryFilter};
use crate::database::entities::{flights::Model as FlightEntity, flights::Column as FlightColumns, prelude::Flights};

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
    
    pub async fn flight_in_progress(db: &DatabaseConnection) -> Result<bool, DbErr> {
        let result = Flights::find()
            .filter(FlightColumns::EndTimestamp.is_null())    
            .one(db)        
            .await?
            .map(|_| true)
            .unwrap_or(false);
        Ok(result)
    }

}
