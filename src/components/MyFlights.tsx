import Sheet from '@mui/joy/Sheet';
import FlightsPane from './FlightsPane.tsx';
import { useListFlights } from '../state/flights.ts';
import { BlurredContainer } from './BlurContainer.tsx';
import { useFlightStoreSelector } from '../hooks/useFlightStoreSelector.ts';
import Button from '@mui/joy/Button';
import { Box, IconButton } from '@mui/joy';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import { useState } from 'react';
import { Flight } from '../bindings/Flight.ts';

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

interface FlightDetailsProps {
  flight: Flight;
}
const FlightDetails = (props: FlightDetailsProps) => {
  const { flight } = props;
  const clearSelectedFlight = useFlightStoreSelector((s) => s.clearSelectedFlight);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Sheet
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'transparent',
      }}
    >
      <Stack direction='row' justifyContent='start' alignItems='center'>
        <Button
          variant='plain'
          onClick={() => clearSelectedFlight()}
          startDecorator={<KeyboardArrowLeftIcon />}
        >
          Back
        </Button>
        <Typography
          sx={{
            textAlign: 'center',
            flex: 1,
          }}
        >
          Flight
        </Typography>
        <IconButton variant='plain' onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVertIcon />
        </IconButton>
        <FlightMenu flight={flight} anchor={menuAnchor} onClose={() => setMenuAnchor(null)} />
      </Stack>
      <Box>Flight details will be displayed here</Box>
    </Sheet>
  );
};

interface FlightMenuProps {
  flight: Flight;
  anchor?: HTMLElement | null;
  onClose?: () => void;
}
export const FlightMenu = (props: FlightMenuProps) => {
  const { anchor, onClose } = props;

  const handleMenuClose = () => {
    onClose?.();
  };

  const handleDelete = () => {
    // TODO: Implement delete flight functionality
    console.log('Delete flight');
    handleMenuClose();
  };

  return (
    <Menu
      id='flight-menu'
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={handleMenuClose}
      placement='bottom-end'
    >
      <MenuItem onClick={handleDelete}>Delete</MenuItem>
    </Menu>
  );
};
