pub use sea_orm_migration::prelude::*;

mod m20240320_000001_create_table;
mod m20260125_000001_add_aircraft_model;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240320_000001_create_table::Migration),
            Box::new(m20260125_000001_add_aircraft_model::Migration),
        ]
    }
}
