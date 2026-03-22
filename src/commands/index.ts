import { invoke } from '@tauri-apps/api/core';
import { Flight } from '../bindings/Flight.ts';
import { FlightData } from '../bindings/FlightData.ts';

export async function listFlights(): Promise<Flight[]> {
  return await invoke('list_flights');
}

export async function createFlight(): Promise<void> {
  return await invoke('create_flight');
}

export async function isFlightInProgress(): Promise<boolean> {
  return await invoke('is_flight_in_progress');
}

export async function isSimulatorPaused(): Promise<boolean> {
  return await invoke('is_simulator_paused');
}

export async function getFlightData(flightId: string): Promise<FlightData[]> {
  return await invoke('get_flight_data', { flightId });
}

export async function deleteFlight(flightId: string): Promise<void> {
  return await invoke('delete_flight', { flightId });
}
