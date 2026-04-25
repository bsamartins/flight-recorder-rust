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
                    .add_column(ColumnDef::new(FlightData::FlapsHandleIndex).integer())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(FlightData::Table)
                    .drop_column(FlightData::FlapsHandleIndex)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum FlightData {
    Table,
    FlapsHandleIndex,
}
