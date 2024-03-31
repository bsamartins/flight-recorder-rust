use sea_orm::Database;
use sea_orm::DatabaseConnection;
use sea_orm::DbErr;
use super::migrations::{Migrator, MigratorTrait};

pub async fn initialize(database: &str) -> Result<DatabaseConnection, DbErr> {
    println!("Initializing database: {}", database);
    let db = Database::connect(format!("sqlite:{}?mode=rwc", database)).await?;
    println!("Database initialized");

    Migrator::up(&db, None).await?;
    println!("Migration executed");

    return Ok(db);
}
