import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { FlightData } from '../bindings/FlightData.ts';
import { Flight } from '../bindings/Flight.ts';
import { getFlightData } from '../commands';
import { Event, listen } from '@tauri-apps/api/event';

export interface FlightStoreState {
  planePosition?: PlanePosition;
  flightData: FlightData[];
  selectedFlight?: Flight;
  dataTimeout?: NodeJS.Timeout;

  setSelectedFlight: (flight: Flight | null) => void;
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

        setSelectedFlight: async (flight: Flight | null) => {
          set({ selectedFlight: flight ?? undefined });
          if (get().dataTimeout) {
            clearInterval(get().dataTimeout);
          }
          if (flight) {
            const x = async () => {
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
              await x();
            } else {
              const timeout = setInterval(x, 1000);
              set({ dataTimeout: timeout });
            }
          } else {
            set({ flightData: [], dataTimeout: undefined });
          }
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
