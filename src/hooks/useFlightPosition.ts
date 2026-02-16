import { useCallback, useState } from 'react';
import { TauriEvent, useTauriListen } from './useTauriListen.ts';

export interface FlightPosition {
  latitude: number;
  longitude: number;
  heading: number;
  altitude: number;
  airspeed: number;
}

interface FligthPositionEvent {
  latitude: number;
  longitude: number;
  heading: number;
  altitude: number;
  airspeed: number;
}

export function useFlightPosition() {
  const [position, setPosition] = useState<FlightPosition | null>(null);

  const handlePositionEvent = useCallback(
    (event: TauriEvent<FligthPositionEvent>) => {
      setPosition(event.payload);
    },
    [setPosition],
  );

  useTauriListen<FlightPosition>('flight-position', handlePositionEvent);

  return position;
}
