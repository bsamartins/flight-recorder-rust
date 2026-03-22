import { useFlightStoreContext } from '../context/FlightStoreContext.tsx';
import { FlightStoreState } from '../store/flightDataStore';

/**
 * Hook to select specific parts of the flight store state
 * Provides fine-grained reactivity - component only re-renders when selected value changes
 *
 * @example
 * const selectedFlight = useFlightStoreSelector(state => state.selectedFlight);
 * const flightData = useFlightStoreSelector(state => state.flightData);
 */
export function useFlightStoreSelector<T>(
  selector: (state: FlightStoreState) => T,
): T {
  const store = useFlightStoreContext();
  return store(selector);
}
