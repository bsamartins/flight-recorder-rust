use std::fmt::{Debug, Formatter};
use std::time::Duration;

use tokio_cron_scheduler::{Job, JobScheduler, JobSchedulerError};
use uuid::Uuid;
use flight_instrumentation::FlightInstrumentation;
use crate::instrumentation::flight_instrumentation::{self, FlightEvent};
use tauri::{AppHandle, Emitter};
use crate::repositories::flight_repository::FlightRepository;

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

                        // Update aircraft and aircraft_model on first data point if not already set
                        if !aircraft_updated {
                            if let Ok(Some(flight)) = flight_repository.get_flight_in_progress().await {
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
                    FlightEvent::SimEnded => {
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

impl Debug for FlightRecorder {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "FlightRecorder{{}}")
    }
}