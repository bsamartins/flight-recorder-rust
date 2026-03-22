import Sheet from '@mui/joy/Sheet';
import FlightsPane from './FlightsPane.tsx';
import { useListFlights } from '../state/flights.ts';
import { BlurredContainer } from './BlurContainer.tsx';
import { useFlightStoreSelector } from '../hooks/useFlightStoreSelector.ts';
import Button from '@mui/joy/Button';
import { Box } from '@mui/joy';

export default function MyFlights() {
  const { data: flights = [] } = useListFlights();
  const selectedFlight = useFlightStoreSelector((s) => s.selectedFlight);
  return (
    <BlurredContainer
      sx={{
        display: 'flex',
        width: '350px',
        minHeight: 0,
        m: 2,
        p: 2,
      }}
    >
      {selectedFlight ? (
        <FlightDetails />
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

const FlightDetails = () => {
  const clearSelectedFlight = useFlightStoreSelector((s) => s.clearSelectedFlight);
  return (
    <Sheet
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'transparent',
      }}
    >
      <Button variant='plain' onClick={() => clearSelectedFlight()}>
        {'<'} Back
      </Button>
      <Box>Flight details will be displayed here</Box>
    </Sheet>
  );
};
