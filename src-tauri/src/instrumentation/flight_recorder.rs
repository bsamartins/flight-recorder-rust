use std::fmt::{Debug, Formatter};
use std::time::Duration;

use crate::database::entities::flight_data::ActiveModel as FlightDataActiveModel;
use crate::database::entities::flight_data::Model as FlightDataEntity;
use crate::database::entities::flights::Model as FlightEntity;
use crate::instrumentation::flight_instrumentation::{self, AirplaneData, FlightEvent};
use crate::repositories::flight_repository::FlightRepository;
use chrono::{DateTime, Utc};
use flight_instrumentation::FlightInstrumentation;
use sea_orm::entity::*;
use tauri::{AppHandle, Emitter};
use tokio_cron_scheduler::{Job, JobScheduler, JobSchedulerError};
use uuid::Uuid;

pub struct FlightRecorder {
    scheduler: JobScheduler,
}

impl FlightRecorder {
    pub async fn new() -> Result<FlightRecorder, JobSchedulerError> {
        let scheduler = JobScheduler::new().await?;
        return Ok(
            FlightRecorder {
                scheduler,
            }
        )
    }

    pub async fn start(
        self,
        mut flight_instrumentation: FlightInstrumentation,
        flight_repository: FlightRepository,
        app_handle: AppHandle,
    ) -> Result<Uuid, String> {
        tracing::info!("Starting recorder");
        tokio::spawn(async move {
            let rx = flight_instrumentation.receiver();
            let mut aircraft_updated = false;
            while let Some(event) = rx.recv().await {
                match event {
                    FlightEvent::Data(data) => {
                        tracing::info!("Received data: {:?}", data);

                        // Emit position data to frontend
                        let _ = app_handle.emit("flight-position", serde_json::json!({
                            "latitude": data.lat,
                            "longitude": data.lon,
                            "heading": data.heading_indictor,
                            "altitude": data.altitude,
                            "airspeed": data.airspeed_indicated,
                        }));

                        // Save flight data to database
                        if let Ok(Some(flight)) = flight_repository.get_flight_in_progress().await {
                            record_flight_data(&flight_repository, &flight.id, &data).await;
                            // Update aircraft and aircraft_model on first data point if not already set
                            if !aircraft_updated {
                                if flight.aircraft.is_none() || flight.aircraft_model.is_none() {
                                    if let Err(e) = flight_repository.update_aircraft_and_model(&flight.id, &data.atc_id, &data.title).await {
                                        tracing::error!("Failed to update aircraft info: {}", e);
                                    } else {
                                        tracing::info!("Updated aircraft to: {}, aircraft_model to: {}", data.atc_id, data.title);
                                    }
                                }
                                aircraft_updated = true;
                            }
                        }
                    }
                    FlightEvent::SessionStarted => {
                        tracing::info!("Session started");
                    }
                    FlightEvent::SessionEnded => {
                        tracing::info!("Sim ended, ending flight");
                        if let Ok(Some(flight)) = flight_repository.get_flight_in_progress().await {
                            if let Err(e) = flight_repository.end_flight(&flight.id).await {
                                tracing::error!("Failed to end flight: {}", e);
                            } else {
                                tracing::info!("Flight ended: {}", flight.id);
                                let aircraft_model = flight.aircraft_model.unwrap_or_else(|| "Unknown Aircraft".to_string());
                                let _ = app_handle.emit("flight-ended", serde_json::json!({
                                    "flightId": flight.id,
                                    "aircraftModel": aircraft_model,
                                }));
                            }
                        }
                    }
                }
            }
        });
        let job_result = Job::new_repeated(Duration::from_secs(1), Self::execute);
        let job = match job_result {
            Ok(job) => {
                job
            }
            Err(err) => {
                return Err(format!("Failed to start flight recorder: {err}"));
            }
        };
        let add_result = self.scheduler.add(job).await;
        let uuid = match add_result {
            Ok(uuid) => {
                uuid
            }
            Err(err) => {
                return Err(format!("Failed to start flight recorder: {err}"));
            }
        };
        let scheduler_start_result = self.scheduler.start().await;
        match scheduler_start_result {
            Ok(_) => {}
            Err(err) => {
                return Err(format!("Failed to start flight recorder: {err}"));
            }
        }
        Ok(uuid)
    }

    fn execute(uuid: Uuid, _scheduler: JobScheduler) {
        tracing::debug!("Executing task {uuid}")
    }
}

async fn record_flight_data(flight_repository: &FlightRepository, flight_id: &str, data: &AirplaneData) {
    let flight_data = FlightDataActiveModel {
        flight_id: Set(flight_id.to_string()),
        latitude: Set(data.lat),
        longitude: Set(data.lon),
        heading: Set(data.heading_indictor),
        altitude: Set(data.altitude),
        altitude_above_ground: Set(data.altitude_above_ground),
        ground_altitude: Set(data.altitude_ground),
        indicated_airspeed: Set(data.airspeed_indicated),
        true_airspeed: Set(data.airspeed_true),
        ground_speed: Set(data.ground_velocity),
        timestamp: Set(Utc::now()),
        ..Default::default()
    };
    if let Err(e) = flight_repository.save_flight_data(flight_data).await {
        tracing::error!("Failed to save flight data: {}", e);
    }

}

impl Debug for FlightRecorder {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "FlightRecorder{{}}")
    }
}