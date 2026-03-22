use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .add_column(ColumnDef::new(FlightData::VerticalSpeed).double())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .add_column(ColumnDef::new(FlightData::Pitch).double())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .add_column(ColumnDef::new(FlightData::Bank).double())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .drop_column(FlightData::VerticalSpeed)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .drop_column(FlightData::Pitch)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .drop_column(FlightData::Bank)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum FlightData {
    Table,
    VerticalSpeed,
    Pitch,
    Bank,
}