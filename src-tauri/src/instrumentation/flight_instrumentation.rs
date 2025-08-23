use std::{error::Error, time::Duration};
use std::fmt::{Debug};
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};
use tokio::sync::Mutex;

use simconnect_sdk::{Notification, SimConnect, SimConnectObject, SystemEvent};
use tokio::task::JoinHandle;
use tokio::time::sleep;

pub struct FlightInstrumentation {
    connected: Arc<AtomicBool>,
    stop_signal: Arc<AtomicBool>,
    background_task: Option<JoinHandle<()>>,
    paused: Arc<AtomicBool>,
    airplane_data: Arc<Mutex<Option<AirplaneData>>>,
}

impl FlightInstrumentation {
    pub fn new() -> Self {
        Self {
            connected: Arc::new(AtomicBool::new(false)),
            stop_signal: Arc::new(AtomicBool::new(false)),
            background_task: None,
            paused: Arc::new(AtomicBool::new(false)),
            airplane_data: Arc::new(Mutex::new(None)),
        }
    }

    pub fn start(&mut self) {
        let connected = self.connected.clone();
        let stop_signal = self.stop_signal.clone();
        self.background_task = Some(tokio::spawn(async move {
            let mut connect_tries = 0;
            loop {
                if stop_signal.load(Ordering::Relaxed) {
                    connected.store(false, Ordering::Relaxed);
                    break;
                }
                tracing::trace!("Attempting to connect");
                let sim_connect_client = SimConnect::new("FlightRecorder");

                match sim_connect_client {
                    Ok(mut sim_connect_client) => {
                        connected.store(true, Ordering::Relaxed);
                        connect_tries = 0;
                        while connected.load(Ordering::Relaxed) && !stop_signal.load(Ordering::Relaxed) {
                            let handle_res = self.handle_dispatch(&mut sim_connect_client).await;
                            match handle_res {
                                Err(err) => {
                                    tracing::warn!("Dispatch error: {}", err)
                                }
                                _ => {}
                            }
                            sleep(Duration::from_millis(100)).await;
                        }
                        connected.store(false, Ordering::Relaxed);
                    }
                    Err(e) => {
                        tracing::warn!("Unable to connect to SimConnect: {}", e);
                        connect_tries += 1;
                    }
                }

                if connect_tries > 0 {
                    sleep(Duration::from_secs(5)).await;
                }
            }
        }));
    }

    async fn handle_dispatch(&self, sim_connect_client: &mut SimConnect) -> Result<(), Box<dyn Error>> {
        tracing::trace!("Next dispatch");
        let notification = sim_connect_client.get_next_dispatch()?;
        match notification {
            Some(Notification::Open) => {
                tracing::info!("Connection opened.");
                sim_connect_client.register_object::<AirplaneData>()?;
                sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Crashed)?;
                sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Pause)?;
                sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Sim)?;
            }
            Some(Notification::Object(data)) => {
                if let Ok(airplane_data) = AirplaneData::try_from(&data) {
                    tracing::debug!("{airplane_data:?}");
                    let mut lock = self.airplane_data.lock().await;
                    *lock = Some(airplane_data);
                }
            }
            Some(Notification::SystemEvent(event)) => match event {
                SystemEvent::Crashed => {
                    tracing::debug!("Crashed");
                }
                SystemEvent::Pause { state } => {
                    tracing::debug!("Pause: {}", state);
                    self.paused.store(state, Ordering::Relaxed);
                }
                SystemEvent::Sim { state } => {
                    tracing::debug!("Sim: {}", state);
                }
                _ => {}
            },
            Some(Notification::Quit) => {
                tracing::info!("SimConnect quit");
                self.connected.store(false, Ordering::Relaxed);
            }
            _ => (),
        }
        Ok(())
    }

    pub async fn stop(&mut self) {
        self.stop_signal.store(true, Ordering::Relaxed);
        if let Some(handle) = self.background_task.take() {
            let _ = handle.await;
        }
        self.connected.store(false, Ordering::Relaxed);
    }

    pub fn is_connected(&self) -> bool {
        self.connected.load(Ordering::Relaxed)
    }

    pub fn is_paused(&self) -> bool {
        self.paused.load(Ordering::Relaxed)
    }

    pub async fn get_airplane_data(&self) -> Option<AirplaneData> {
        let lock = self.airplane_data.lock().await;
        lock.clone()
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
