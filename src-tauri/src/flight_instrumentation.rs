use std::{error::Error, time::Duration};
use std::borrow::Borrow;
use std::fmt::{Debug, Formatter};
use std::rc::Rc;

use chrono::{DateTime, FixedOffset};
use simconnect_sdk::{Notification, SimConnect, SimConnectObject, SystemEvent};
use tokio::sync::Mutex;
use tokio::time::sleep;
use tokio_cron_scheduler::{JobScheduler, JobSchedulerError};

#[derive(Default, Debug)]
pub struct FlightInstrumentation {
    connected: bool,
    data: Option<AirplaneData>,
    paused: bool,
}

impl FlightInstrumentation {
    pub fn new() -> FlightInstrumentation {
        FlightInstrumentation::default()
    }

    pub fn data(self) -> Option<AirplaneData> {
        return self.data;
    }

    pub fn start(mut self) -> Result<(), Box<dyn Error>> {
        tracing::info!("Starting instrumentation");
        tokio::spawn(async move {
            let mut connect_tries = 0;
            loop {
                tracing::trace!("Attempting to connect");
                let sim_connect_client = SimConnect::new("FlightRecorder");

                match sim_connect_client {
                    Ok(mut sim_connect_client) => {
                        self.connected = true;
                        connect_tries = 0;
                        let rc = Box::new(sim_connect_client.borrow());
                        while self.connected {
                            let handle_res = self.handle_dispatch(rc.clone());
                            match handle_res {
                                Err(err) => {
                                    tracing::warn!("Dispatch error: {}", err)
                                }
                                _ => {}
                            }
                            // sleep for about a frame to reduce CPU usage
                            sleep(Duration::from_millis(100)).await;
                        }
                    }
                    Err(e) => {
                        tracing::warn!("Unable to connect to SimConnect: {}", e);
                        connect_tries += 1;
                    }
                }

                if connect_tries > 0 {
                    // if not first attempt to connect
                    sleep(Duration::from_secs(5)).await;
                }
            }
        });
        Ok(())
    }

    fn handle_dispatch(&mut self, mut sim_connect_client: Box<&SimConnect>) -> Result<(), Box<dyn Error>> {
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
                    self.data = Some(airplane_data);
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
        Ok(())
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
