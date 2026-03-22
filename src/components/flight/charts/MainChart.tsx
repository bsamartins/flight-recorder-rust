import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FlightData } from '../../../bindings/FlightData.ts';
import { formatTime } from './utils.ts';
import { useMemo } from 'react';

export const MainChart = ({ flightData }: { flightData: FlightData[] }) => {
  const chartData = flightData.map((point) => ({
    timestamp: formatTime(point.timestamp),
    groundAltitude: Math.round(point.groundAltitude),
    planeAltitude: Math.round(point.altitude),
    airspeed: Math.round(point.indicatedAirspeed * 10) / 10,
  }));

  const maxAltitude = useMemo(() => {
    const dataMax = chartData
      .map((d) => d.planeAltitude)
      .reduce((max, altitude) => Math.max(max, altitude), 10000);
    return Math.ceil(dataMax / 10000) * 10000;
  }, [chartData]);

  const maxAirspeed = useMemo(() => {
    const dataMax = chartData
      .map((d) => d.airspeed)
      .reduce((max, altitude) => Math.max(max, altitude), 100);
    return Math.ceil(dataMax / 100) * 100;
  }, [chartData]);

  const generateAltitudeTicks = () => {
    const tickSize = Math.ceil(maxAltitude / 5);
    const ticks = [];
    for (let i = 0; i <= 5; i += 1) {
      ticks.push(i * tickSize);
    }
    return ticks;
  };

  // Generate airspeed ticks based on max airspeed
  const generateAirspeedTicks = () => {
    const ticks = [];
    for (let i = 0; i <= maxAirspeed; i += 100) {
      ticks.push(i);
    }
    return ticks;
  };

  console.log(generateAltitudeTicks());

  return (
    <ResponsiveContainer width='100%' height={250}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.1)' />
        <XAxis
          dataKey='timestamp'
          stroke='none'
          style={{ fontSize: '12px' }}
          tick={{ fill: 'white', dy: 10 }}
          angle={-30}
        />
        <YAxis
          stroke='none'
          style={{ fontSize: '12px' }}
          tick={{ fill: 'white' }}
          domain={[0, maxAltitude]}
          ticks={generateAltitudeTicks()}
        />
        <YAxis
          yAxisId='airspeedAxis'
          orientation='right'
          stroke='none'
          style={{ fontSize: '12px' }}
          tick={{ fill: 'white' }}
          domain={[0, maxAirspeed]}
          ticks={generateAirspeedTicks()}
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
        <Area
          type='monotone'
          dataKey='planeAltitude'
          stroke='#2196F3'
          fill='#2196F3'
          fillOpacity={0.3}
          name='Plane Altitude (ft)'
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          type='monotone'
          dataKey='groundAltitude'
          stroke='#8B4513'
          fill='#8B4513'
          name='Ground Elvation (ft)'
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type='monotone'
          dataKey='airspeed'
          stroke='#FFD700'
          yAxisId='airspeedAxis'
          name='Indicated Airspeed (knots)'
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
