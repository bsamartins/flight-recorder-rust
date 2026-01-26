import {invoke} from "@tauri-apps/api/core";
import {Flight} from "../bindings/Flight.ts";

export async function greet(name: string): Promise<string> {
    return await invoke("greet", {name});
}

export async function listFlights(): Promise<Flight[]> {
    return await invoke("list_flights");
}

export async function createFlight(): Promise<void> {
    return await invoke("create_flight");
}

export async function isFlightInProgress(): Promise<boolean> {
    return await invoke("is_flight_in_progress");
}

export async function isSimulatorPaused(): Promise<boolean> {
    return await invoke("is_simulator_paused");
}
