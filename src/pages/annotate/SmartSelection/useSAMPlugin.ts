import { useEffect, useState } from 'react';
import { usePluginManifold } from '@annotorious/react-manifold';
import { mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';

export const useSAMPlugin = () => {

  const plugin = usePluginManifold<ReturnType<typeof mountOpenSeadragonPlugin>>('smart-selection');

  const [busy, setBusy] = useState(true);

  const [error, setError] = useState<any | undefined>();

  useEffect(() => {
    if (!plugin) return;

    const removeInitHandler = plugin.on('initialized', () => setBusy(false));
    const removeInitErrorHander = plugin.on('initError', (error: any) => setError(error));
    const removeStartAnimationHandler = plugin.on('animationStart', () => setBusy(true));
    const removeStartEncodingHandler = plugin.on('encodingStart', () => setBusy(true));
    const removeEncodingCompleteHanlder = plugin.on('encodingFinished', () => setBusy(false));

    return () => {
      removeInitHandler();
      removeInitErrorHander();
      removeStartAnimationHandler();
      removeStartEncodingHandler();
      removeEncodingCompleteHanlder();
    }
  }, [plugin]);

  return { plugin, busy, error };

}