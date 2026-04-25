export type FuelUnit = 'liters' | 'gallons' | 'pounds' | 'kg';

export const FUEL_UNIT_LABELS: Record<FuelUnit, string> = {
  liters: 'Liters',
  gallons: 'Gallons',
  pounds: 'Pounds',
  kg: 'Kilograms',
};

export const FUEL_UNIT_ABBREVIATIONS: Record<FuelUnit, string> = {
  liters: 'L',
  gallons: 'gal',
  pounds: 'lbs',
  kg: 'kg',
};

// Conversion factors
const GALLONS_TO_LITERS = 3.78541;
const POUNDS_TO_KG = 0.453592;

export function convertFuelValue(
  fuelTotalQuantity: number | null,
  fuelTotalQuantityWeight: number | null,
  toUnit: FuelUnit
): number | null {
  switch (toUnit) {
    case 'gallons':
      return fuelTotalQuantity;
    case 'liters':
      return fuelTotalQuantity ? fuelTotalQuantity * GALLONS_TO_LITERS : null;
    case 'pounds':
      return fuelTotalQuantityWeight;
    case 'kg':
      return fuelTotalQuantityWeight ? fuelTotalQuantityWeight * POUNDS_TO_KG : null;
  }
}
