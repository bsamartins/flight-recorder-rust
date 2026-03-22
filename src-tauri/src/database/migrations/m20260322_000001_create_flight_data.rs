use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(FlightData::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(FlightData::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(FlightData::FlightId).string().not_null())
                    .col(ColumnDef::new(FlightData::Latitude).double().not_null())
                    .col(ColumnDef::new(FlightData::Longitude).double().not_null())
                    .col(ColumnDef::new(FlightData::Heading).double().not_null())
                    .col(ColumnDef::new(FlightData::Altitude).double().not_null())
                    .col(ColumnDef::new(FlightData::AltitudeAboveGround).double().not_null())
                    .col(ColumnDef::new(FlightData::GroundAltitude).double().not_null())
                    .col(
                        ColumnDef::new(FlightData::IndicatedAirspeed)
                            .double()
                            .not_null(),
                    )
                    .col(ColumnDef::new(FlightData::TrueAirspeed).double().not_null())
                    .col(ColumnDef::new(FlightData::GroundSpeed).double().not_null())
                    .col(
                        ColumnDef::new(FlightData::Timestamp)
                            .timestamp()
                            .default(SimpleExpr::Keyword(Keyword::CurrentTimestamp))
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_flight_data_flight_id")
                            .from(FlightData::Table, FlightData::FlightId)
                            .to(Flights::Table, Flights::Id),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(FlightData::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum FlightData {
    Table,
    Id,
    FlightId,
    Latitude,
    Longitude,
    Heading,
    Altitude,
    AltitudeAboveGround,
    GroundAltitude,
    IndicatedAirspeed,
    TrueAirspeed,
    GroundSpeed,
    Timestamp,
}

#[derive(DeriveIden)]
enum Flights {
    Table,
    Id,
}
