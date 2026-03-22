import { useFlightStoreSelector } from './useFlightStoreSelector.ts';

export const usePlanePosition = () => useFlightStoreSelector((s) => s.planePosition);
