import { useEffect, useState } from 'react';
import { usePluginManifold } from '@annotorious/react-manifold';
import { mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';

export const useSAMPlugin = () => {

  const plugin = usePluginManifold<ReturnType<typeof mountOpenSeadragonPlugin>>('smart-selection');

  const [busy, setBusy] = useState(true);

  const [error, setError] = useState<any | undefined>();

  useEffect(() => {
    if (!plugin?.on) return;

    const removeInitHandlers = plugin.on('initialized', () => setBusy(false));
    const removeInitErrorHanders = plugin.on('initError', (error: any) => setError(error));
    const removeStartAnimationHandlers = plugin.on('animationStart', () => setBusy(true));
    const removeStartEncodingHandlers = plugin.on('encodingStart', () => setBusy(true));
    const removeEncodingCompleteHanlders = plugin.on('encodingFinished', () => setBusy(false));

    return () => {
      removeInitHandlers.forEach(fn => fn());
      removeInitErrorHanders.forEach(fn => fn());
      removeStartAnimationHandlers.forEach(fn => fn());
      removeStartEncodingHandlers.forEach(fn => fn());
      removeEncodingCompleteHanlders.forEach(fn => fn());
    }
  }, [plugin]);

  return { plugin, busy, error };

}