// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::task;
use chrono::{DateTime, FixedOffset};
use influxdb2::{Client, FromDataPoint};
use simconnect_sdk::{Notification, SimConnect, SimConnectObject};
use tokio::time::{sleep};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// fn main() {
//     tauri::Builder::default()
//         .invoke_handler(tauri::generate_handler![greet])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let sim_connect_client = SimConnect::new("Receiving data example");
    let influx_client = Client::new("localhost:8086", "test", "token");

    match sim_connect_client {
        Ok(mut sim_connect_client) => {
            let mut notifications_received = 0;

            loop {
                let notification = sim_connect_client.get_next_dispatch()?;

                match notification {
                    Some(Notification::Open) => {
                        println!("Connection opened.");

                        // After the connection is successfully open, we register the struct
                        sim_connect_client.register_object::<AirplaneData>()?;
                    }
                    Some(Notification::Object(data)) => {
                        if let Ok(airplane_data) = AirplaneData::try_from(&data) {
                            println!("{airplane_data:?}");
                            notifications_received += 1;
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

async fn write(client: &Client, data: &AirplaneData) -> Result<(), Box<dyn std::error::Error>>  {
    use futures::prelude::*;
    use influxdb2::models::DataPoint;

    let points = vec![
        DataPoint::builder("flight")
            .field("indicate_airspeed", data.airspeed_indicated)
            .build()?,
        DataPoint::builder("flight")
            .field("airspeed_true", data.airspeed_true)
            .build()?,
        DataPoint::builder("flight").field("altitude", data.alt)
            .build()?,
    ];

    client.write("flight", stream::iter(points)).await?;

    Ok(())
}

#[derive(Debug, Clone, SimConnectObject)]
#[simconnect(period = "second")]
#[allow(dead_code)]
struct AirplaneData {
    #[simconnect(name = "TITLE")]
    title: String,
    #[simconnect(name = "CATEGORY")]
    category: String,
    #[simconnect(name = "PLANE LATITUDE", unit = "degrees")]
    lat: f64,
    #[simconnect(name = "PLANE LONGITUDE", unit = "degrees")]
    lon: f64,
    #[simconnect(name = "PLANE ALTITUDE", unit = "feet")]
    alt: f64,
    #[simconnect(name = "AIRSPEED INDICATED", unit = "knots")]
    airspeed_indicated: f64,
    #[simconnect(name = "AIRSPEED TRUE", unit = "knots")]
    airspeed_true: f64,
    #[simconnect(name = "SIM ON GROUND")]
    sim_on_ground: bool,
}

#[derive(Debug, Default, FromDataPoint)]
struct InfluxMetrics {
    ticker: String,
    value: f64,
    time: DateTime<FixedOffset>,
}
