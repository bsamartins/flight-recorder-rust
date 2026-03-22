import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { FlightData } from '../bindings/FlightData.ts';
import { Flight } from '../bindings/Flight.ts';

export interface FlightStoreState {
  flightData: FlightData[];
  selectedFlight: Flight | null;

  setSelectedFlight: (flight: Flight | null) => void;
}

export const useFlightStore = create<FlightStoreState>()(
  devtools(
    subscribeWithSelector((set) => ({
      flightData: [],
      selectedFlight: null,
      setSelectedFlight: (flight: Flight | null) => set({ selectedFlight: flight }),
    })),
    {
      name: 'flight-data-store',
    },
  ),
);
