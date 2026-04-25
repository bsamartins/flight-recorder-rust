import { Box, Select, Option, Typography } from '@mui/joy';
import { useFlightStore } from '../../store/flightStore';
import { FuelUnit, FUEL_UNIT_LABELS } from '../../types/fuelUnit';

export const FuelUnitSelector = () => {
  const fuelUnit = useFlightStore((state) => state.fuelUnit);
  const setFuelUnit = useFlightStore((state) => state.setFuelUnit);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography level='body-sm'>Fuel Unit</Typography>
      <Select value={fuelUnit} onChange={(_, value) => value && setFuelUnit(value as FuelUnit)}>
        {Object.entries(FUEL_UNIT_LABELS).map(([value, label]) => (
          <Option key={value} value={value}>
            {label}
          </Option>
        ))}
      </Select>
    </Box>
  );
};
