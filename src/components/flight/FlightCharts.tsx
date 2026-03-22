import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

  // Format timestamp as HH:MM
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Prepare chart data with formatted timestamps
  const chartData = flightData.map((point) => ({
    timestamp: formatTime(point.timestamp),
    groundAltitude: Math.round(point.groundAltitude),
    planeAltitude: Math.round(point.altitude),
    airspeed: Math.round(point.indicatedAirspeed * 10) / 10,
  }));

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
      }}
    >
      <ResponsiveContainer width='100%' height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.1)' />
          <XAxis
            dataKey='timestamp'
            stroke='white'
            label={{ position: 'insideBottomRight', offset: -5 }}
            style={{ fontSize: '12px' }}
            tick={{ fill: 'white' }}
          />
          <YAxis
            stroke='white'
            style={{ fontSize: '12px' }}
            tick={{ fill: 'white' }}
            domain={[0, 'dataMax']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'white' }}
            formatter={(value) => {
              if (typeof value === 'number') {
                return value.toFixed(1);
              }
              return value;
            }}
          />
          <Line
            type='monotone'
            dataKey='groundAltitude'
            stroke='#8B4513'
            name='Ground Altitude (ft)'
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line
            type='monotone'
            dataKey='planeAltitude'
            stroke='#2196F3'
            name='Plane Altitude (ft)'
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line
            type='monotone'
            dataKey='airspeed'
            stroke='#FFD700'
            name='Indicated Airspeed (knots)'
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
