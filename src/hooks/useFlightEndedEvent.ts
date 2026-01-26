import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { useTauriListen } from './useTauriListen.ts';
import { useCallback } from 'react';
import { EventCallback } from '@tauri-apps/api/event';

interface FlightEndedPayload {
  flightId: string;
  aircraftModel: string;
}

export function useFlightEndedEvent() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const handleEvent = useCallback<EventCallback<FlightEndedPayload>>((event) => {
    console.log('Flight completed event received:', event);
    const { aircraftModel } = event.payload;
    enqueueSnackbar(`Flight Completed: ${aircraftModel}`, {
      variant: 'success',
      autoHideDuration: 4000,
    });
    // Invalidate the flights query to refresh the list
    void queryClient.invalidateQueries({ queryKey: ['list-flights'] });
    void queryClient.invalidateQueries({ queryKey: ['is-flight-in-progress'] });
  }, []);

  useTauriListen<FlightEndedPayload>('flight-ended', handleEvent);
}
