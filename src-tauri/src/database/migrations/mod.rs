pub use sea_orm_migration::prelude::*;

mod m20240320_000001_create_table;
mod m20260125_000001_add_aircraft_model;
mod m20260322_000001_create_flight_data;
mod m20260322_000002_add_flight_dynamics;
mod m20260425_000001_add_fuel_data;
mod m20260425_000002_add_flaps_data;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240320_000001_create_table::Migration),
            Box::new(m20260125_000001_add_aircraft_model::Migration),
            Box::new(m20260322_000001_create_flight_data::Migration),
            Box::new(m20260322_000002_add_flight_dynamics::Migration),
            Box::new(m20260425_000001_add_fuel_data::Migration),
            Box::new(m20260425_000002_add_flaps_data::Migration),
        ]
    }
}
