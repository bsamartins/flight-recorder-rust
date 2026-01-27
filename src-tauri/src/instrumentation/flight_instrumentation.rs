use std::{time::Duration};
use std::fmt::Debug;
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};

use simconnect_sdk::{Notification, SimConnect, SimConnectObject, SystemEvent};

#[derive(Debug, Clone)]
pub enum FlightEvent {
    Data(AirplaneData),
    SessionStarted,
    SessionEnded,
}

pub struct FlightInstrumentation {
    connected: Arc<AtomicBool>,
    stop_signal: Arc<AtomicBool>,
    paused: Arc<AtomicBool>,
    tx: tokio::sync::mpsc::Sender<FlightEvent>,
    rx: tokio::sync::mpsc::Receiver<FlightEvent>,
}

impl FlightInstrumentation {
    pub fn new() -> Self {
        let (tx, rx) = tokio::sync::mpsc::channel(100);
        Self {
            connected: Arc::new(AtomicBool::new(false)),
            stop_signal: Arc::new(AtomicBool::new(false)),
            paused: Arc::new(AtomicBool::new(false)),
            tx,
            rx,
        }
    }

    pub fn start(&mut self) {
        let connected = self.connected.clone();
        let stop_signal = self.stop_signal.clone();
        let paused = self.paused.clone();
        let tx = self.tx.clone();
        std::thread::spawn(move || {
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
                        let mut session_active: bool = false;

                        while connected.load(Ordering::Relaxed) && !stop_signal.load(Ordering::Relaxed) {
                            tracing::trace!("Next dispatch");
                            let dispatch_result = sim_connect_client.get_next_dispatch();
                            match dispatch_result {
                                Ok(notification) => {
                                    match notification {
                                        Some(Notification::Open) => {
                                            tracing::info!("Connection opened.");
                                            sim_connect_client.register_object::<AirplaneData>().unwrap();
                                            sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Crashed).unwrap();
                                            sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Pause).unwrap();
                                            sim_connect_client.subscribe_to_system_event(simconnect_sdk::SystemEventRequest::Sim).unwrap();
                                        }
                                        Some(Notification::Object(data)) => {
                                            if let Ok(airplane_data) = AirplaneData::try_from(&data) {
                                                tracing::debug!("{airplane_data:?}");

                                                tracing::info!("Camera state {}, is paused {:?}", airplane_data.camera_state, paused);

                                                if session_active && airplane_data.camera_state == 12.0 {
                                                    tracing::info!("Camera state transition 34 -> 35 detected - ending session");
                                                    session_active = false;
                                                    let _ = tx.try_send(FlightEvent::SessionEnded);
                                                }

                                                // End flight if camera state is in [2, 5] and sim is not paused
                                                if !session_active && airplane_data.camera_state >= 2.0 && airplane_data.camera_state <= 5.0 {
                                                    tracing::info!("Session started");
                                                    session_active = true;
                                                    let _ = tx.try_send(FlightEvent::SessionStarted);
                                                }

                                                let _ = tx.try_send(FlightEvent::Data(airplane_data));
                                            }
                                        }
                                        Some(Notification::SystemEvent(event)) => match event {
                                            SystemEvent::Crashed => {
                                                tracing::debug!("Crashed");
                                                let _ = tx.try_send(FlightEvent::SessionEnded);
                                            }
                                            SystemEvent::Pause { state } => {
                                                tracing::debug!("Pause: {}", state);
                                                paused.store(state, Ordering::Relaxed);
                                            }
                                            SystemEvent::Sim { state } => {
                                                tracing::debug!("Sim: {}", state);
                                                if !state {
                                                    let _ = tx.try_send(FlightEvent::SessionEnded);
                                                }
                                            }
                                            _ => {}
                                        },
                                        Some(Notification::Quit) => {
                                            tracing::info!("SimConnect quit");
                                            connected.store(false, Ordering::Relaxed);
                                        }
                                        _ => (),
                                    }
                                }
                                Err(err) => {
                                    tracing::warn!("Dispatch error: {}", err)
                                }
                            }
                            std::thread::sleep(Duration::from_millis(100));
                        }
                        connected.store(false, Ordering::Relaxed);
                    }
                    Err(e) => {
                        tracing::warn!("Unable to connect to SimConnect: {}", e);
                        connect_tries += 1;
                    }
                }

                if connect_tries > 0 {
                    std::thread::sleep(Duration::from_secs(5));
                }
            }
        });
    }

    pub fn is_connected(&self) -> bool {
        self.connected.load(Ordering::Relaxed)
    }

    pub fn is_paused(&self) -> bool {
        self.paused.load(Ordering::Relaxed)
    }

    pub fn get_paused(&self) -> Arc<AtomicBool> {
        self.paused.clone()
    }

    pub fn receiver(&mut self) -> &mut tokio::sync::mpsc::Receiver<FlightEvent> {
        &mut self.rx
    }
}

#[derive(Debug, Clone, SimConnectObject)]
#[simconnect(period = "second")]
#[allow(dead_code)]
pub struct AirplaneData {
    #[simconnect(name = "CAMERA STATE")]
    pub camera_state: f64,
    #[simconnect(name = "SIM ON GROUND")]
    pub sim_on_ground: f64,
    #[simconnect(name = "TITLE")]
    pub title: String,
    #[simconnect(name = "CATEGORY")]
    pub category: String,
    #[simconnect(name = "ATC ID")]
    pub atc_id: String,
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
    #[simconnect(name = "HEADING INDICATOR", unit = "degrees")]
    pub heading_indictor: f64,
    // #[simconnect(name = "FUEL TOTAL CAPACITY", unit = "liters")]
    // pub fuel_total_capacity: f64,
    // #[simconnect(name = "FUEL TOTAL QUANTITY", unit = "liters")]
    // pub fuel_total_quantity: f64,
    // #[simconnect(name = "FUEL TOTAL QUANTITY WEIGHT", unit = "pounds")]
    // pub fuel_total_quantity_weight: f64,
}
