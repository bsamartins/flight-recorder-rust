import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PauseIcon from '@mui/icons-material/Pause';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useIsSimulatorPaused, useIsFlightInProgress } from '../state/flights';

export default function Status() {
  const [instrumentationConnected, setInstrumentationConnected] = useState<boolean | null>(null);
  const { data: simulatorPaused = true } = useIsSimulatorPaused();
  const { data: flightInProgress } = useIsFlightInProgress();

  useEffect(() => {
    invoke<boolean>('is_instrumentation_connected').then(setInstrumentationConnected);
  }, []);

  if (instrumentationConnected === false) {
    return (
      <LinkOffIcon sx={{ color: 'var(--joy-palette-neutral-400)' }} titleAccess='Not connected' />
    );
  }

  if (instrumentationConnected === true && flightInProgress) {
    if (simulatorPaused) {
      return <PauseIcon color='warning' titleAccess='Recording - paused' />;
    }
    return <FiberManualRecordIcon color='error' titleAccess='Recording' />;
  }

  if (instrumentationConnected === true && !flightInProgress) {
    return <LinkIcon color='success' titleAccess='Connected' />;
  }

  return null;
}
