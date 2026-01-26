import {atom, useAtom} from 'jotai';
import {isFlightInProgress, listFlights as listFlightsCommand, isSimulatorPaused} from '../commands';
import {useQuery} from '@tanstack/react-query';
import {Flight} from '../bindings/Flight.ts';

export const selectedFlightAtom = atom<Flight | null>(null);

export function useListFlights() {
    return useQuery({
        queryKey: ['list-flights'],
        queryFn: async () => {
            return await listFlightsCommand();
        },
    });
}

export const useSelectedFlight = () => useAtom(selectedFlightAtom);

export function useIsFlightInProgress() {
    return useQuery({
        queryKey: ['is-flight-in-progress'],
        queryFn: async () => {
            console.log('Fetching');
            return await isFlightInProgress()
        },
        refetchInterval: 1000,
        refetchIntervalInBackground: true,
    });
}

export function useIsSimulatorPaused() {
    return useQuery({
        queryKey: ['is-simulator-paused'],
        queryFn: async () => {
            return await isSimulatorPaused()
        },
        refetchInterval: 1000,
        refetchIntervalInBackground: true,
    });
}
