use super::migrations::{Migrator, MigratorTrait};
use sea_orm::Database;
use sea_orm::DatabaseConnection;
use sea_orm::DbErr;

pub async fn initialize(database: &str) -> Result<DatabaseConnection, DbErr> {
    tracing::info!("Initializing database: {}", database);
    let db = Database::connect(format!("sqlite:{}?mode=rwc", database)).await?;
    tracing::info!("Database initialized");

    Migrator::up(&db, None).await?;
    tracing::info!("Migration executed");

    return Ok(db);
}
