import {invoke} from "@tauri-apps/api/tauri";
import {Flight} from "../bindings/Flight.ts";

export async function greet(name: string): Promise<string> {
    return await invoke("greet", {name})
}

export async function listFlights(): Promise<Flight[]> {
    return await invoke("list_flights")
}

export async function createFlight(): Promise<void> {
    return await invoke("create_flight")
}
