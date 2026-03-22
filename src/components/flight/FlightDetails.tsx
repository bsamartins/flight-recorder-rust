import { useState } from 'react';
import Button from '@mui/joy/Button';
import { Box, ButtonGroup, IconButton } from '@mui/joy';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Flight } from '../../bindings/Flight.ts';
import { useFlightStoreSelector } from '../../hooks/useFlightStoreSelector.ts';
import { FlightMenu } from './FlightMenu.tsx';
import { FlightCharts } from './FlightCharts.tsx';

interface FlightDetailsProps {
  flight: Flight;
}

export const FlightDetails = (props: FlightDetailsProps) => {
  const { flight } = props;
  const clearSelectedFlight = useFlightStoreSelector((s) => s.clearSelectedFlight);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [view, setView] = useState<'overview' | 'data'>('overview');
  const flightData = useFlightStoreSelector((s) => s.flightData);
  const lastFlightDataPoint = flightData.length ? flightData[flightData.length - 1] : null;

  return (
    <Stack
      direction='column'
      spacing={2}
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'transparent',
        minHeight: 0,
        overflow: 'auto',
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
      <ButtonGroup buttonFlex={1} sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <Button
          variant='outlined'
          disabled={view === 'overview'}
          onClick={() => setView('overview')}
        >
          Overview
        </Button>
        <Button variant='outlined' disabled={view === 'data'} onClick={() => setView('data')}>
          Charts
        </Button>
      </ButtonGroup>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {view === 'overview' && <Box>Flight overview will be displayed here</Box>}
        {view === 'data' && (
          <>
            <Box>
              <DataPoint
                label='Altitude (ft)'
                value={round(lastFlightDataPoint?.altitude)?.toString() ?? '-'}
              />
              <DataPoint
                label='Vertical Speed (fpm)'
                value={round(lastFlightDataPoint?.verticalSpeed)?.toString() ?? '-'}
              />
              <DataPoint
                label='Pitch'
                value={round(lastFlightDataPoint?.pitch)?.toString() ?? '-'}
              />
              <DataPoint label='Bank' value={round(lastFlightDataPoint?.bank)?.toString() ?? '-'} />
            </Box>
            <FlightCharts flightData={flightData} />
          </>
        )}
      </Box>
    </Stack>
  );
};

const DataPoint = ({ label, value }: { label: string; value: string }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Typography level='title-lg'>{value}</Typography>
      <Typography level='body-sm'>{label}</Typography>
    </Box>
  );
};

const round = (number?: number | null) => {
  if (number === undefined || number === null) return undefined;
  return Math.round(number);
};
