import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';

interface FlightEndedPayload {
  flightId: string;
  aircraftModel: string;
}

export function useFlightEndedEvent() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setupListener = async () => {
      unlisten = await listen<FlightEndedPayload>('flight-ended', (event) => {
        console.log('Flight completed event received:', event);
        const { aircraftModel } = event.payload;
        enqueueSnackbar(`Flight Completed: ${aircraftModel}`, {
          variant: 'success',
          autoHideDuration: 4000,
        });
        // Invalidate the flights query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['list-flights'] });
        queryClient.invalidateQueries({ queryKey: ['is-flight-in-progress'] });
      });
    };

    setupListener().catch((err) =>
      console.error('Failed to setup flight completed listener:', err),
    );

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [enqueueSnackbar, queryClient]);
}
