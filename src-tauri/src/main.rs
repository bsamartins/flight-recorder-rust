// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::error::Error;

use chrono::{DateTime, FixedOffset};
use influxdb2::{Client, FromDataPoint};
use simconnect_sdk::{Notification, SimConnect, SimConnectObject};
use tokio::time::sleep;

mod cmd;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
fn main() {
    tauri::Builder::default()
        .setup(setup)
        .invoke_handler(tauri::generate_handler![cmd::greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {
    println!("{}", app.path_resolver().app_data_dir().unwrap().to_string_lossy());
    println!("{}", app.path_resolver().app_local_data_dir().unwrap().to_string_lossy());
    Ok(())
}

#[tokio::main]
async fn main_x() -> Result<(), Box<dyn Error>> {
    let sim_connect_client = SimConnect::new("Receiving data example");
    let influx_client = Client::new("http://localhost:8086", "test_org", "2e_irTK_ZcnL9tXXvRC2wR5OMUKNgD4tWE8gkPBQAYn2KFJgm2Xe7JDRcAi4_pjtGM4JjVpwd30qOa3T_ff0tg==");

    match sim_connect_client {
        Ok(mut sim_connect_client) => {
            loop {
                let notification = sim_connect_client.get_next_dispatch()?;

                match notification {
                    Some(Notification::Open) => {
                        println!("Connection opened.");

                        // After the connection is successfully open, we register the struct
                        sim_connect_client.register_object::<cmd::AirplaneData>()?;
                    }
                    Some(Notification::Object(data)) => {
                        if let Ok(airplane_data) = cmd::AirplaneData::try_from(&data) {
                            println!("{airplane_data:?}");
                            let write_result = write(&influx_client, &airplane_data).await;
                            match write_result {
                                Err(err) => {
                                    println!("Influx error: {err:?}");
                                }
                                _ => ()
                            }

                            // After we have received 10 notifications, we unregister the struct
                            // if notifications_received > 10 {
                            //     sim_connect_client.unregister_object::<AirplaneData>()?;
                            //     println!("Subscription stopped.");
                            //     break;
                            // }
                        }
                    }
                    _ => ()
                }

                // sleep for about a frame to reduce CPU usage
                sleep(std::time::Duration::from_millis(16)).await;
            }
        }
        Err(e) => {
            println!("Error: {e:?}")
        }
    }
    Ok(())
}

async fn write(client: &Client, data: &cmd::AirplaneData) -> Result<(), Box<dyn std::error::Error>>  {
    use futures::prelude::*;
    use influxdb2::models::DataPoint;

    let points = vec![
        DataPoint::builder("flight")
            .field("airspeed_indicated", data.airspeed_indicated)
            .build()?,
        DataPoint::builder("flight")
            .field("airspeed_true", data.airspeed_true)
            .build()?,
        DataPoint::builder("flight")
            .field("altitude", data.altitude)
            .build()?,
        DataPoint::builder("flight")
            .field("altitude_above_ground", data.altitude_above_ground)
            .build()?,
        DataPoint::builder("flight")
            .field("altitude_above_ground_minus_cg", data.altitude_above_ground_minus_cg)
            .build()?,
        DataPoint::builder("flight")
            .field("altitude_ground", data.altitude_ground)
            .build()?,
        DataPoint::builder("flight")
            .field("vertical_speed", data.vertical_speed)
            .build()?,
        DataPoint::builder("flight")
            .field("ground_velocity", data.ground_velocity)
            .build()?,
        DataPoint::builder("flight")
            .field("fuel_total_capacity", data.fuel_total_capacity)
            .build()?,
        DataPoint::builder("flight")
            .field("fuel_total_quantity", data.fuel_total_quantity)
            .build()?,
        DataPoint::builder("flight")
            .field("fuel_total_quantity_weight", data.fuel_total_quantity_weight)
            .build()?,
    ];

    client.write("test_bucket", stream::iter(points)).await?;

    Ok(())
}

#[derive(Debug, Default, FromDataPoint)]
struct InfluxMetrics {
    ticker: String,
    value: f64,
    time: DateTime<FixedOffset>,
}

struct Flight {
    departure: String,
    arrival: String,
    aircraft: String
}
