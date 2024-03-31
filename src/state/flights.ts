import {atom, useAtom} from "jotai";
import {listFlights as listFlightsCommand} from "../commands";
import {atomWithQuery} from "jotai-tanstack-query";
import {Flight} from "../bindings/Flight.ts";

export const selectedFlightAtom = atom<Flight | null>(null);

export const flightsAtom = atomWithQuery(() => ({
    queryKey: ['list-flights'],
    queryFn: async () => {
        return await listFlightsCommand()
    },
}));

export function useListFlights() {
    const [result] = useAtom(flightsAtom);
    return result
}

export const useSelectedFlight = () => useAtom(selectedFlightAtom);
