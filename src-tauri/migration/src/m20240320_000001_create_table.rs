use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Flights::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Flights::Id)
                            .string()
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Flights::Departure).string().not_null())
                    .col(ColumnDef::new(Flights::Arrival).string().not_null())
                    .col(ColumnDef::new(Flights::Aircraft).string().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Flights::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Flights {
    Table,
    Id,
    Departure,
    Arrival,
    Aircraft
}
