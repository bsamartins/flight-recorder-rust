import Sheet from '@mui/joy/Sheet';
import FlightsPane from './FlightsPane.tsx';
import { useListFlights } from '../state/flights.ts';

export default function MyFlights() {
  const { data: flights = [] } = useListFlights();
  return (
    <Sheet
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '350px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        minHeight: 0,
        m: 2,
        borderRadius: 'var(--joy-radius-sm)',
      }}
    >
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
    </Sheet>
  );
}
