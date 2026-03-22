import Sheet from '@mui/joy/Sheet';
import FlightsPane from './FlightsPane.tsx';
import { useListFlights } from '../state/flights.ts';
import { BlurredContainer } from './BlurContainer.tsx';
import { useFlightStoreSelector } from '../hooks/useFlightStoreSelector.ts';
import { FlightDetails } from './flight/FlightDetails.tsx';

export default function MyFlights() {
  const { data: flights = [] } = useListFlights();
  const selectedFlight = useFlightStoreSelector((s) => s.selectedFlight);

  return (
    <BlurredContainer
      sx={{
        display: 'flex',
        width: selectedFlight ? 500 : 350,
        minHeight: 0,
        m: 2,
        p: 2,
        transition: 'width 0.3s ease-in-out',
      }}
    >
      {selectedFlight ? (
        <FlightDetails flight={selectedFlight} />
      ) : (
        <Sheet
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: 'transparent',
            flex: 1,
            minHeight: 0,
          }}
        >
          <FlightsPane flights={flights} />
        </Sheet>
      )}
    </BlurredContainer>
  );
}
