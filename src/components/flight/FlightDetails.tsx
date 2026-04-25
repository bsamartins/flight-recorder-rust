import { useState } from 'react';
import Button from '@mui/joy/Button';
import { Box, ButtonGroup, IconButton } from '@mui/joy';
import { Grid } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Flight } from '../../bindings/Flight.ts';
import { useFlightStoreSelector } from '../../hooks/useFlightStoreSelector.ts';
import { FlightMenu } from './FlightMenu.tsx';
import { FlightCharts } from './FlightCharts.tsx';
import { FuelUnitSelector } from '../settings/FuelUnitSelector.tsx';

interface FlightDetailsProps {
  flight: Flight;
}

export const FlightDetails = (props: FlightDetailsProps) => {
  const { flight } = props;
  const clearSelectedFlight = useFlightStoreSelector((s) => s.clearSelectedFlight);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [view, setView] = useState<'overview' | 'statistics'>('statistics');
  const flightData = useFlightStoreSelector((s) => s.flightData);
  const lastFlightDataPoint = flightData.length ? flightData[flightData.length - 1] : null;

  return (
    <Stack
      direction='column'
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
      <ButtonGroup buttonFlex={1} sx={{ display: 'flex', justifyContent: 'space-evenly', py: 1 }}>
        <Button
          variant={view === 'overview' ? 'solid' : 'plain'}
          disabled={view === 'overview'}
          onClick={() => setView('overview')}
        >
          Overview
        </Button>
        <Button
          variant={view === 'statistics' ? 'solid' : 'plain'}
          disabled={view === 'statistics'}
          onClick={() => setView('statistics')}
        >
          Statistics
        </Button>
      </ButtonGroup>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pt: 3 }}>
        {view === 'overview' && <Box>Flight overview will be displayed here</Box>}
        {view === 'statistics' && (
          <Stack spacing={5} direction='column'>
            <Grid container spacing={2} sx={{ flexGrow: 1, mx: 1 }}>
              <Grid size={4}>
                <DataPoint
                  label='Altitude (ft)'
                  value={round(lastFlightDataPoint?.altitude)?.toString() ?? '-'}
                />
              </Grid>
              <Grid size={4}>
                <DataPoint
                  label='Airspeed (kts)'
                  value={round(lastFlightDataPoint?.indicatedAirspeed)?.toString() ?? '-'}
                />
              </Grid>
              <Grid size={4}>
                <DataPoint
                  label='Ground speed (kts)'
                  value={round(lastFlightDataPoint?.groundSpeed)?.toString() ?? '-'}
                />
              </Grid>
              <Grid size={4}>
                <DataPoint
                  label='Vertical Speed (fpm)'
                  value={round(lastFlightDataPoint?.verticalSpeed)?.toString() ?? '-'}
                />
              </Grid>
              <Grid size={4}>
                <DataPoint
                  label='Pitch'
                  value={round(lastFlightDataPoint?.pitch)?.toString() ?? '-'}
                />
              </Grid>
              <DataPoint label='Bank' value={round(lastFlightDataPoint?.bank)?.toString() ?? '-'} />
            </Grid>
            <Box sx={{ mx: 1, maxWidth: 200 }}>
              <FuelUnitSelector />
            </Box>
            <FlightCharts flightData={flightData} />
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

const DataPoint = ({ label, value }: { label: string; value: string }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Typography level='title-lg'>{value}</Typography>
      <Typography level='body-xs'>{label}</Typography>
    </Box>
  );
};

const round = (number?: number | null) => {
  if (number === undefined || number === null) return undefined;
  return Math.round(number);
};
