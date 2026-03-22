import {
  isFlightInProgress,
  isSimulatorPaused,
  listFlights as listFlightsCommand,
} from '../commands';
import { useQuery } from '@tanstack/react-query';
import { useFlightStoreSelector } from '../hooks/useFlightStoreSelector.ts';

export function useListFlights() {
  return useQuery({
    queryKey: ['list-flights'],
    queryFn: () => listFlightsCommand(),
  });
}

export function useIsFlightInProgress() {
  return useQuery({
    queryKey: ['is-flight-in-progress'],
    queryFn: () => isFlightInProgress(),
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
}

export function useIsSimulatorPaused() {
  return useQuery({
    queryKey: ['is-simulator-paused'],
    queryFn: () => isSimulatorPaused(),
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
}

export const useSelectedFlight = () => useFlightStoreSelector((s) => s.selectedFlight);
