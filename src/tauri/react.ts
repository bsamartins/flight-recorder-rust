import { useEffect, useState } from 'react';
import { UnlistenFn } from '@tauri-apps/api/event';
import { getCurrent } from '@tauri-apps/api/window';

export const useWindowMaximized: () => boolean = () => {
  const [maximized, setMaximized] = useState(false);
  useEffect(() => {
    let unregisterListener: UnlistenFn | undefined;
    const fetchIsMaximized = () => {
      getCurrent()
        .isMaximized()
        .then((res) => setMaximized(res));
    };

    const doStuff = async () => {
      fetchIsMaximized();
      unregisterListener = await getCurrent().onResized(() => {
        fetchIsMaximized();
      });
    };
    doStuff().catch((err) => console.error(err));
    return () => {
      unregisterListener?.();
    };
  }, []);
  return maximized;
};
