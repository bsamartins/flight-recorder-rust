import { Box, Button, ButtonGroup } from '@mui/joy';
import { useFlightStore } from '../../store/flightStore';
import { FUEL_UNIT_ABBREVIATIONS, FuelUnit } from '../../types/fuelUnit';

export const FuelUnitSelector = () => {
  const fuelUnit = useFlightStore((state) => state.fuelUnit);
  const setFuelUnit = useFlightStore((state) => state.setFuelUnit);

  const units: FuelUnit[] = ['gallons', 'liters', 'pounds', 'kg'];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
      <ButtonGroup size='sm' sx={{ '--ButtonGroup-radius': '4px' }}>
        {units.map((unit) => (
          <Button
            key={unit}
            variant={fuelUnit === unit ? 'solid' : 'outlined'}
            onClick={() => setFuelUnit(unit)}
            sx={{
              fontSize: '11px',
              minHeight: '24px',
              px: 1.5,
              py: 0.5,
            }}
          >
            {FUEL_UNIT_ABBREVIATIONS[unit]}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};
