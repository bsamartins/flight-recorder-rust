import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FlightData } from '../../../bindings/FlightData.ts';
import { formatTime } from './utils.ts';
import { useFlightStore } from '../../../store/flightStore.ts';
import { convertFuelValue, FUEL_UNIT_ABBREVIATIONS } from '../../../types/fuelUnit.ts';

export const FuelChart = ({ flightData }: { flightData: FlightData[] }) => {
  const fuelUnit = useFlightStore((state) => state.fuelUnit);
  const chartData = flightData
    .map((point) => {
      const fuelValue = convertFuelValue(
        point.fuelTotalQuantity,
        point.fuelTotalQuantityWeight,
        fuelUnit
      );
      return fuelValue != null
        ? {
            timestamp: formatTime(point.timestamp),
            fuelQuantity: Math.round(fuelValue * 10) / 10,
          }
        : null;
    })
    .filter((point) => point !== null);

  if (chartData.length === 0) return null;

  const unit = FUEL_UNIT_ABBREVIATIONS[fuelUnit];

  return (
    <ResponsiveContainer width='100%' height={200}>
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
          unit={` ${unit}`}
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
          formatter={(value) => [`${value} ${unit}`, 'Fuel Remaining']}
        />
        <Area
          type='monotone'
          dataKey='fuelQuantity'
          stroke='#4CAF50'
          fill='#4CAF50'
          fillOpacity={0.3}
          name={`Fuel Remaining (${unit})`}
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};