use sea_orm::prelude::Uuid;
use sea_orm::Database;
use sea_orm::DbErr;
use migration::{Migrator, MigratorTrait};
use sea_orm::EntityTrait;
use sea_orm::Set;
use crate::entities::flights::ActiveModel as FlightModel;

use super::entities::prelude::*;

pub async fn init() -> Result<(), DbErr> {
    println!("Initalizing database");
    let db = Database::connect("sqlite:./test.sqlite?mode=rwc").await?;
    println!("Database initialized");

    Migrator::up(&db, None).await?;
    println!("Migration executed");

    Migrator::status(&db).await?;
    println!("Migration status executed");

    let flight = Flights::insert(FlightModel {
        id: Set(Uuid::new_v4().to_string()),
        departure: Set("LPPT".to_string()), 
        arrival: Set("LPPR".to_string()),
        aircraft: Set("Fenix A320".to_string())
    }).exec(&db)
    .await?;

    Ok(())
}
