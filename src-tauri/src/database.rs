use std::borrow::Borrow;

use sea_orm::Database;
use sea_orm::DbErr;
use sea_orm::entity::prelude::*;
use migration::{Migrator, MigratorTrait};

pub async fn init() -> Result<(), DbErr> {
    println!("Initalizing database");
    let db = Database::connect("sqlite:./test.sqlite?mode=rwc").await?;
    println!("Database initialized");

    Migrator::up(&db, None).await?;
    println!("Migration executed");

    Migrator::status(&db).await?;
    println!("Migration status executed");

    Ok(())
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "flights")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub departure: String,
    pub arrival: String,
    pub aircraft: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
