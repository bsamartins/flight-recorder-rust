import { Box, Typography } from '@mui/joy';
import { FlightData } from '../../bindings/FlightData.ts';
import { MainChart } from './charts/MainChart.tsx';

interface FlightChartsProps {
  flightData: FlightData[];
}

export const FlightCharts = ({ flightData }: FlightChartsProps) => {
  if (!flightData || flightData.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography level='body-sm' color='neutral'>
          No flight data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
      }}
    >
      <MainChart flightData={flightData} />
    </Box>
  );
};
