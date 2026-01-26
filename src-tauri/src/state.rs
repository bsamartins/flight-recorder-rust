use std::sync::{Mutex, Arc, atomic::AtomicBool};

pub struct FlightState {
    pub instrumentation_connected: Mutex<bool>,
    pub paused: Mutex<Option<Arc<AtomicBool>>>,
}

impl Default for FlightState {
    fn default() -> Self {
        Self {
            instrumentation_connected: Mutex::new(false),
            paused: Mutex::new(None),
        }
    }
}

impl FlightState {
    pub fn set_instrumentation_connected(&self, connected: bool) {
        let mut status = self.instrumentation_connected.lock().unwrap();
        *status = connected;
    }
    pub fn is_instrumentation_connected(&self) -> bool {
        let status = self.instrumentation_connected.lock().unwrap();
        *status
    }
    pub fn set_paused(&self, paused: Arc<AtomicBool>) {
        let mut paused_state = self.paused.lock().unwrap();
        *paused_state = Some(paused);
    }
    pub fn is_paused(&self) -> bool {
        let paused_state = self.paused.lock().unwrap();
        paused_state
            .as_ref()
            .map(|p| p.load(std::sync::atomic::Ordering::Relaxed))
            .unwrap_or(false)
    }
}
