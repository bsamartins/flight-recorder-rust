import { useQuery } from '@tanstack/react-query';
import { getFlightData } from '../commands';

export const useGetFlightData = (flightId: string, query?: { enabled: boolean }) => {
  return useQuery({
    queryKey: ['flight-data', flightId],
    queryFn: () => getFlightData(flightId),
    ...query,
  });
};
