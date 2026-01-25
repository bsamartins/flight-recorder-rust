import * as React from 'react';
import Box from '@mui/joy/Box';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { ListItemButtonProps } from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { toggleMessagesPane } from '../utils';
import { Flight } from '../bindings/Flight.ts';
import { FlightLandRounded, FlightTakeoffRounded } from '@mui/icons-material';
import { useSelectedFlight } from '../state/flights.ts';

type FlightListItemProps = ListItemButtonProps & {
  flight: Flight;
};

export default function FlightListItem(props: FlightListItemProps) {
  const [selectedFlight, setSelectedFlight] = useSelectedFlight();
  const { flight } = props;
  const selected = selectedFlight?.id === flight.id;
  return (
    <React.Fragment>
      <ListItem
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 'var(--joy-radius-sm)',
        }}
      >
        <ListItemButton
          onClick={() => {
            toggleMessagesPane();
            setSelectedFlight(flight);
          }}
          selected={selected}
          color='neutral'
          sx={{
            flexDirection: 'column',
            alignItems: 'initial',
            gap: 1,
            borderRadius: 'var(--joy-radius-sm)',
          }}
        >
          <Stack direction='row' spacing={1.5}>
            <Box sx={{ flex: 1 }}>
              <Box>
                <Typography level='title-sm'>Aircraft</Typography>
                <Typography level='body-sm'>{flight.aircraft}</Typography>
              </Box>
              <Stack direction='column'>
                <Box sx={{ flex: 1 }}>
                  <Typography level='body-sm'>
                    <FlightTakeoffRounded />
                    {flight.departure}
                  </Typography>
                  <Typography level='body-sm'>
                    <FlightLandRounded />
                    {flight.arrival}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </ListItemButton>
      </ListItem>
    </React.Fragment>
  );
}
