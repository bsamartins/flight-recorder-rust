import {atom, useAtom} from "jotai";
import {isFlightInProgress, listFlights as listFlightsCommand} from "../commands";
import {atomWithQuery} from "jotai-tanstack-query";
import {Flight} from "../bindings/Flight.ts";

export const selectedFlightAtom = atom<Flight | null>(null);

export const flightsAtom = atomWithQuery(() => ({
    queryKey: ['list-flights'],
    queryFn: async () => {
        return await listFlightsCommand();
    },
}));

export const isFlightInProgressAtom = atomWithQuery(() => ({
    queryKey: ['is-flight-in-progress'],
    queryFn: async () => {
        console.log('Fetching');
        return await isFlightInProgress()
    },
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
}));

export function useListFlights() {
    const [result] = useAtom(flightsAtom);
    return result
}

export const useSelectedFlight = () => useAtom(selectedFlightAtom);

export const useIsFlightInProgress = () => useAtom(isFlightInProgressAtom);
