import {invoke} from "@tauri-apps/api/tauri";
import {Flight} from "../bindings/Flight.ts";

export async function greet(name: string): Promise<string> {
    return await invoke("greet", {name})
}

export async function listFlights(): Promise<Flight[]> {
    return await invoke("list_flights")
}
