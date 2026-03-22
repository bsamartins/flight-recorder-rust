import React, { createContext, useContext } from 'react';
import { useFlightStore } from '../store/flightStore.ts';

interface FlightStoreContextType {
  useStore: typeof useFlightStore;
}

const FlightStoreContext = createContext<FlightStoreContextType | undefined>(undefined);

export function FlightStoreProvider({ children }: { children: React.ReactNode }) {
  const value: FlightStoreContextType = {
    useStore: useFlightStore,
  };

  return <FlightStoreContext.Provider value={value}>{children}</FlightStoreContext.Provider>;
}

export function useFlightStoreContext() {
  const context = useContext(FlightStoreContext);
  if (!context) {
    throw new Error('useFlightDataContext must be used within FlightDataProvider');
  }
  return context.useStore;
}
