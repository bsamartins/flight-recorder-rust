use std::fmt::{Debug, Formatter};
use std::time::Duration;

use tokio_cron_scheduler::{Job, JobScheduler, JobSchedulerError};
use uuid::Uuid;
use flight_instrumentation::FlightInstrumentation;
use crate::instrumentation::flight_instrumentation;

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

    pub async fn start(self, flight_instrumentation: FlightInstrumentation) -> Result<Uuid, String> {
        tracing::info!("Starting recorder");
        let data = flight_instrumentation.data();
        tracing::info!("instrumentation -> {data:?}");
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
        tracing::info!("Executing task {uuid}")
    }
}

impl Debug for FlightRecorder {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "FlightRecorder{{}}")
    }
}