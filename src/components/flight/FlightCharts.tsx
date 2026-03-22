import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/joy';
import { FlightData } from '../../bindings/FlightData.ts';

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

  // Prepare data series
  const groundAltitudeData = flightData.map((point) => point.groundAltitude);
  const planeAltitudeData = flightData.map((point) => point.altitude);
  const airspeedData = flightData.map((point) => point.indicatedAirspeed);
  const xAxisData = flightData.map((_, index) => index);

  return (
    <Box
      sx={{
        width: '100%',
        mt: 2,
        '& .MuiLineChart-root': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <LineChart
        series={[
          {
            data: groundAltitudeData,
            label: 'Ground Altitude (ft)',
            color: '#8B4513',
          },
          {
            data: planeAltitudeData,
            label: 'Plane Altitude (ft)',
            color: '#2196F3',
          },
          {
            data: airspeedData,
            label: 'Indicated Airspeed (knots)',
            color: '#FFD700',
          },
        ]}
        xAxis={[{ scaleType: 'linear', data: xAxisData, label: 'Time Index' }]}
        width={600}
        height={400}
        margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
        sx={{
          '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabelStyle': {
            fill: 'rgba(255,255,255,0.7)',
          },
          '& .MuiChartsAxis-left .MuiChartsAxis-tickLabelStyle': {
            fill: 'rgba(255,255,255,0.7)',
          },
          '& .MuiChartsAxis-bottom .MuiChartsAxis-line': {
            stroke: 'rgba(255,255,255,0.2)',
          },
          '& .MuiChartsAxis-left .MuiChartsAxis-line': {
            stroke: 'rgba(255,255,255,0.2)',
          },
          '& .MuiChartsLegend-root': {
            color: 'rgba(255,255,255,0.8)',
          },
        }}
      />
    </Box>
  );
};