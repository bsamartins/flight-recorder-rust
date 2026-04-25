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
                    .add_column(ColumnDef::new(FlightData::FuelTotalQuantity).double())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .add_column(ColumnDef::new(FlightData::FuelTotalQuantityWeight).double())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .drop_column(FlightData::FuelTotalQuantity)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .drop_column(FlightData::FuelTotalQuantityWeight)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum FlightData {
    Table,
    FuelTotalQuantity,
    FuelTotalQuantityWeight,
}