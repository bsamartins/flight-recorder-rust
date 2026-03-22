import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { FlightData } from '../bindings/FlightData.ts';
import { Flight } from '../bindings/Flight.ts';
import { getFlightData } from '../commands';
import { useTauriListen } from '../hooks/useTauriListen.ts';

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
      useTauriListen<PlanePosition>('flight-position', (e) => {
        if (!get().selectedFlight) {
          set({ planePosition: e.payload });
        }
      });
      return {
        flightData: [],

        setSelectedFlight: (flight: Flight | null) => {
          set({ selectedFlight: flight ?? undefined });
          if (flight) {
            const timeout = setInterval(async () => {
              const data = await getFlightData(flight?.id);
              const lastPosition = data.length > 0 ? data[data.length - 1] : null;
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
            }, 1000);
            set({ dataTimeout: timeout });
          } else {
            if (get().dataTimeout) {
              clearInterval(get().dataTimeout);
            }
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
