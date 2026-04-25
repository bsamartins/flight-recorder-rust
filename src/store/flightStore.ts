import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { FlightData } from '../bindings/FlightData.ts';
import { Flight } from '../bindings/Flight.ts';
import { getFlightData } from '../commands';
import { Event, listen } from '@tauri-apps/api/event';
import { FuelUnit } from '../types/fuelUnit.ts';

export interface FlightStoreState {
  planePosition?: PlanePosition;
  flightData: FlightData[];
  selectedFlight?: Flight;
  dataTimeout?: NodeJS.Timeout;
  fuelUnit: FuelUnit;

  setSelectedFlight: (flight: Flight) => void;
  clearSelectedFlight: () => void;
  setFuelUnit: (unit: FuelUnit) => void;
}

export const useFlightStore = create<FlightStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => {
      void listen('flight-position', (e: Event<PlanePosition>) => {
        if (!get().selectedFlight) {
          set({ planePosition: e.payload });
        }
      });

      return {
        flightData: [],
        fuelUnit: 'gallons',

        setSelectedFlight: async (flight) => {
          set({ selectedFlight: flight });
          if (get().dataTimeout) {
            clearInterval(get().dataTimeout);
            set({ dataTimeout: undefined });
          }
          const fetchAndSet = async () => {
            const data = await getFlightData(flight.id);
            const lastPosition = !flight.end && data.length > 0 ? data[data.length - 1] : null;
            set({
              flightData: data,
              planePosition: lastPosition
                ? {
                    latitude: lastPosition.latitude,
                    longitude: lastPosition.longitude,
                    heading: lastPosition.heading,
                  }
                : undefined,
            });
          };

          if (flight.end) {
            await fetchAndSet();
          } else {
            const timeout = setInterval(fetchAndSet, 1000);
            set({ dataTimeout: timeout });
          }
        },
        clearSelectedFlight: () => {
          set({ flightData: [], selectedFlight: undefined });
          if (get().dataTimeout) {
            clearInterval(get().dataTimeout);
            set({ dataTimeout: undefined });
          }
        },
        setFuelUnit: (unit) => {
          set({ fuelUnit: unit });
        },
      };
    }),
    {
      name: 'flight-store',
    },
  ),
);

export interface PlanePosition {
  latitude: number;
  longitude: number;
  heading: number;
}
