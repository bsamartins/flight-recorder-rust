import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { useTauriListen } from './useTauriListen.ts';
import { useCallback } from 'react';
import { EventCallback } from '@tauri-apps/api/event';
import { Flight } from '../bindings/Flight.ts';
import { useFlightStoreSelector } from './useFlightStoreSelector.ts';

interface FlightEndedPayload {
  flight: Flight;
}

export function useFlightEndedEvent() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const selectedFlight = useFlightStoreSelector((s) => s.selectedFlight);
  const setSelectedFlight = useFlightStoreSelector((s) => s.setSelectedFlight);
  const handleEvent = useCallback<EventCallback<FlightEndedPayload>>(
    (event) => {
      enqueueSnackbar('Flight Completed', {
        variant: 'success',
        autoHideDuration: 4000,
      });

      if (selectedFlight?.id === event.payload.flight.id) {
        setSelectedFlight(event.payload.flight);
      }

      // Invalidate the flights query to refresh the list
      void queryClient.invalidateQueries({ queryKey: ['list-flights'] });
      void queryClient.invalidateQueries({ queryKey: ['is-flight-in-progress'] });
    },
    [selectedFlight, setSelectedFlight, queryClient],
  );

  useTauriListen<FlightEndedPayload>('flight-ended', handleEvent);
}
