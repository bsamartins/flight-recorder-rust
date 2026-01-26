import { EventCallback, EventName, listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

export const useTauriListen = <T>(event: EventName, handler: EventCallback<T>) => {
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    const setupListener = async () => {
      unlisten = await listen(event, handler);
    };

    setupListener().catch((err) => console.error(`Failed to listener for: ${event}`, err));

    return () => {
      unlisten?.();
    };
  }, [event, handler]);
};
