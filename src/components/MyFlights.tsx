import Sheet from '@mui/joy/Sheet';
import FlightsPane from './FlightsPane.tsx';
import { useListFlights } from '../state/flights.ts';

export default function MyFlights() {
  const { data: flights = [] } = useListFlights();
  return (
    <Sheet
      sx={{
        backgroundColor: 'yellow',
        flex: 1,
        width: '350px',
      }}
    >
      <Sheet
        sx={{
          position: { xs: 'fixed', sm: 'sticky' },
          transform: {
            xs: 'translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))',
            sm: 'none',
          },
          transition: 'transform 0.4s, width 0.4s',
          zIndex: 100,
          width: '100%',
          top: 52,
        }}
      >
        <FlightsPane flights={flights} />
      </Sheet>
    </Sheet>
  );
}
