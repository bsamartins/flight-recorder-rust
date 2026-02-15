import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Input } from '@mui/joy';
import List from '@mui/joy/List';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FlightListItem from './FlightListItem.tsx';
import { Flight } from '../bindings/Flight.ts';
import Button from '@mui/joy/Button';
import { createFlight } from '../commands';
import { useIsFlightInProgress, useListFlights } from '../state/flights.ts';
import { useMutation } from '@tanstack/react-query';

type FlightsPaneProps = {
  flights: Flight[];
};

export default function FlightsPane(props: FlightsPaneProps) {
  const { flights } = props;
  const { refetch: refetchFlights } = useListFlights();

  const { data: isFlightInProgress, isPending } = useIsFlightInProgress();
  const createMutation = useMutation({
    mutationFn: () => createFlight(),
  });

  const onCreateFlight = async () => {
    await createMutation.mutateAsync();
    await refetchFlights();
  };

  return (
    <Sheet
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        px: 2,
        backgroundColor: 'transparent',
        minHeight: 0,
      }}
    >
      <Stack
        direction='row'
        spacing={1}
        alignItems='center'
        justifyContent='space-between'
        pt={2}
        pb={1.5}
        sx={{
          backgroundColor: 'transparent',
        }}
      >
        <Typography
          fontSize={{ xs: 'md', md: 'lg' }}
          component='h1'
          fontWeight='lg'
          sx={{ mr: 'auto' }}
        >
          Flights
        </Typography>
        <Button
          onClick={() => onCreateFlight()}
          disabled={isFlightInProgress || isPending}
          variant='outlined'
          size='sm'
        >
          Create Flight
        </Button>
      </Stack>
      <Box sx={{ pb: 1.5 }}>
        <Input
          size='sm'
          startDecorator={<SearchRoundedIcon />}
          placeholder='Search'
          aria-label='Search'
        />
      </Box>
      <List
        sx={{
          py: 0,
          overflowY: 'auto',
          '--ListItem-paddingY': '0.75rem',
          '--ListItem-paddingX': '1rem',
          '& .MuiListItem-root:not(:last-child)': {
            mb: 1.5,
          },
          '& .MuiListItemButton-root.Mui-selected': {
            backgroundColor: 'unset',
          },
          '& .MuiListItemButton-root:hover': {
            backgroundColor: 'unset',
          },
          '& .MuiListItem-root': {
            '&:hover': {
              borderColor: (theme) => theme.palette.primary.softColor,
            },
            '&:has(.Mui-selected)': {
              borderColor: (theme) => theme.palette.primary.solidColor,
            },
          },
          minHeight: 0,
          flex: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
          },
          'scrollbar-color': 'rgba(255, 255, 255, 0.3) transparent',
        }}
      >
        {flights.map((flight) => (
          <FlightListItem key={flight.id} flight={flight} />
        ))}
      </List>
    </Sheet>
  );
}
