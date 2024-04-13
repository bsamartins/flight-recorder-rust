use std::{error::Error, time::Duration};
use std::thread::sleep;

use chrono::{DateTime, FixedOffset};
use influxdb2::{Client, FromDataPoint};
use simconnect_sdk::{Notification, SimConnect, SimConnectObject, SystemEvent};

#[derive(Debug, Default, FromDataPoint)]
struct InfluxMetrics {
    ticker: String,
    value: f64,
    time: DateTime<FixedOffset>,
}

#[derive(Default, Debug)]
pub struct FlightInstrumentation {
    connected: bool,
    data: Option<AirplaneData>,
    paused: bool,
}

impl FlightInstrumentation {
    pub fn new() -> FlightInstrumentation {
        return Default::default();
    }

    pub fn start(&mut self) -> Result<(), Box<dyn Error>> {
        tracing::info!("Starting instrumentation");
        let mut connect_tries = 0;
        loop {
            tracing::trace!("Attempting to connect");
            let sim_connect_client = SimConnect::new("FlightRecorder");

            match sim_connect_client {
                Ok(mut sim_connect_client) => {
                    self.connected = true;
                    connect_tries = 0;
                    while self.connected {
                        tracing::trace!("Next dispatch");
                        let notification = sim_connect_client.get_next_dispatch()?;

                        match notification {
                            Some(Notification::Open) => {
                                tracing::info!("Connection opened.");

                                // After the connection is successfully open, we register the struct
                                sim_connect_client.register_object::<AirplaneData>()?;

                                // Register events
                                sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Crashed)?;
                                sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Pause)?;
                                sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Sim)?;
                            }
                            Some(Notification::Object(data)) => {
                                if let Ok(airplane_data) = AirplaneData::try_from(&data) {
                                    tracing::debug!("{airplane_data:?}");
                                    // self.data = Some(airplane_data);
                                }
                            }
                            Some(Notification::SystemEvent(event)) => match event {
                                SystemEvent::Crashed => {
                                    tracing::debug!("Crashed");
                                }
                                SystemEvent::Pause { state } => {
                                    tracing::debug!("Pause: {}", state);
                                    self.paused = state;
                                }
                                SystemEvent::Sim { state } => {
                                    tracing::debug!("Sim: {}", state);
                                }
                                _ => {}
                            }
                            Some(Notification::Quit) => {
                                tracing::info!("SimConnect quit");
                                self.connected = false;
                            }
                            _ => (),
                        }
                        // sleep for about a frame to reduce CPU usage
                        sleep(Duration::from_millis(100));
                    }
                }
                Err(e) => {
                    tracing::warn!("Unable to connect to SimConnect: {}", e);
                    connect_tries += 1;
                }
            }

            if connect_tries > 0 {
                // if not first attempt to connect
                sleep(Duration::from_secs(5));
            }
        }
    }

    fn session_active(self) -> bool {
        let in_game_types = 2.0..5.0;
        return self.data.map(|data| in_game_types.contains(&data.camera_state))
            .unwrap_or(false);
    }

    fn paused(self) -> bool {
        return self.paused;
    }
}

#[derive(Debug, Clone, SimConnectObject)]
#[simconnect(period = "second")]
#[allow(dead_code)]
pub struct AirplaneData {
    #[simconnect(name = "TITLE")]
    pub title: String,
    #[simconnect(name = "CATEGORY")]
    pub category: String,
    #[simconnect(name = "PLANE LATITUDE", unit = "degrees")]
    pub lat: f64,
    #[simconnect(name = "PLANE LONGITUDE", unit = "degrees")]
    pub lon: f64,
    #[simconnect(name = "PLANE ALTITUDE", unit = "feet")]
    pub altitude: f64,
    #[simconnect(name = "PLANE ALT ABOVE GROUND", unit = "feet")]
    pub altitude_above_ground: f64,
    #[simconnect(name = "PLANE ALT ABOVE GROUND MINUS CG", unit = "feet")]
    pub altitude_above_ground_minus_cg: f64,
    #[simconnect(name = "GROUND ALTITUDE", unit = "feet")]
    pub altitude_ground: f64,
    #[simconnect(name = "AIRSPEED INDICATED", unit = "knots")]
    pub airspeed_indicated: f64,
    #[simconnect(name = "AIRSPEED TRUE", unit = "knots")]
    pub airspeed_true: f64,
    #[simconnect(name = "GROUND VELOCITY", unit = "knots")]
    pub ground_velocity: f64,
    #[simconnect(name = "VERTICAL SPEED", unit = "feet per minute")]
    pub vertical_speed: f64,
    #[simconnect(name = "FUEL TOTAL CAPACITY", unit = "gallons")]
    pub fuel_total_capacity: f64,
    #[simconnect(name = "FUEL TOTAL QUANTITY", unit = "gallons")]
    pub fuel_total_quantity: f64,
    #[simconnect(name = "FUEL TOTAL QUANTITY WEIGHT", unit = "pounds")]
    pub fuel_total_quantity_weight: f64,
    #[simconnect(name = "SIM ON GROUND")]
    pub sim_on_ground: bool,
    #[simconnect(name = "CAMERA STATE")]
    pub camera_state: f64,
}

/*
    // let influx_client = Client::new(
    //     "http://localhost:8086",
    //     "test_org",
    //     "2e_irTK_ZcnL9tXXvRC2wR5OMUKNgD4tWE8gkPBQAYn2KFJgm2Xe7JDRcAi4_pjtGM4JjVpwd30qOa3T_ff0tg==",
    // );


                                // let write_result = write(&influx_client, &airplane_data).await;
                            // match write_result {
                            //     Err(err) => {
                            //         tracing::error!("Influx error: {err:?}");
                            //     }
                            //     _ => (),
                            // }
*/
#[allow(dead_code)]
async fn write(client: &Client, data: &AirplaneData) -> Result<(), Box<dyn std::error::Error>> {
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
            .field(
                "altitude_above_ground_minus_cg",
                data.altitude_above_ground_minus_cg,
            )
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
            .field(
                "fuel_total_quantity_weight",
                data.fuel_total_quantity_weight,
            )
            .build()?,
    ];

    client.write("test_bucket", stream::iter(points)).await?;

    Ok(())
}
