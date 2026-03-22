import { UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query';
import { getFlightData } from '../commands';
import { FlightData } from '../bindings/FlightData.ts';

export const useGetFlightData = (
  flightId: string,
  options?: Partial<UndefinedInitialDataOptions<FlightData[]>>,
) => {
  return useQuery({
    queryKey: ['flight-data', flightId],
    queryFn: () => getFlightData(flightId),
    ...options,
  });
};
