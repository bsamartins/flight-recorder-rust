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

  const [{ data: isFlightInProgress, isLoading }] = useIsFlightInProgress();
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
        borderRight: '1px solid',
        borderColor: 'divider',
        height: 'calc(100dvh - var(--Header-height))',
        overflowY: 'auto',
        px: 2,
      }}
    >
      <Stack
        direction='row'
        spacing={1}
        alignItems='center'
        justifyContent='space-between'
        pt={2}
        pb={1.5}
      >
        <Typography
          fontSize={{ xs: 'md', md: 'lg' }}
          component='h1'
          fontWeight='lg'
          sx={{ mr: 'auto' }}
        >
          Flights
        </Typography>
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
        }}
      >
        {flights.map((flight) => (
          <FlightListItem key={flight.id} flight={flight} />
        ))}
      </List>
      <Button
        sx={{ mt: 1.5 }}
        onClick={() => onCreateFlight()}
        disabled={isFlightInProgress || isLoading}
      >
        Create Flight
      </Button>
    </Sheet>
  );
}
