import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useIsSimulatorPaused } from '../state/flights';

export default function Status() {
  const [instrumentationConnected, setInstrumentationConnected] = useState<boolean | null>(null);
  const [simulatorPaused] = useIsSimulatorPaused();

  useEffect(() => {
    invoke<boolean>('is_instrumentation_connected').then(setInstrumentationConnected);
  }, []);

  if (instrumentationConnected === false) {
    return <LinkOffIcon sx={{ color: 'var(--joy-palette-neutral-400)' }} titleAccess='Not connected' />;
  }

  if (instrumentationConnected === true && simulatorPaused?.data) {
    return <LinkIcon color='warning' titleAccess='Connected - paused' />;
  }

  if (instrumentationConnected === true && !simulatorPaused?.data) {
    return <LinkIcon color='success' titleAccess='Connected - flying' />;
  }

  return null;
}
