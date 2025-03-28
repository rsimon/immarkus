import { useEffect, useState } from 'react';
import { usePluginManifold } from '@annotorious/react-manifold';
import { DownloadProgress, mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';

const purgeModel = async () => {
  const root = await navigator.storage.getDirectory();

  return Promise.all([
    root.removeEntry('sam2_hiera_tiny_encoder.with_runtime_opt.ort'),
    root.removeEntry('sam2_hiera_tiny_decoder_pr1.onnx')
  ]).then(() => {
    console.log('done');
  });
}

export const useSAMPlugin = () => {

  const plugin = usePluginManifold<ReturnType<typeof mountOpenSeadragonPlugin>>('smart-selection');

  const [initialized, setInitialized]  = useState(false);

  const [downloading, setDownloading]  = useState(false);

  const [downloadProgress, setDownloadProgress] = useState(0);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<any | undefined>();

  const clear = () => {
    setInitialized(false);
    setDownloading(false);
    setDownloadProgress(0);
    setBusy(false);
    setError(undefined);
  }

  useEffect(() => {
    if (!plugin?.on) return;

    // purgeModel();

    clear();

    const onDownloadProgress = (progress: DownloadProgress) => {
      if (progress.complete) {
        setDownloading(false);
        setDownloadProgress(1);
      } else {
        setDownloadProgress(progress.loaded / progress.total);
      }
    }

    const unsubscribe = [
      plugin.on('downloadStart', () => setDownloading(true)),
      plugin.on('downloadProgress', onDownloadProgress),
      plugin.on('initialized', () => setInitialized(true)),
      plugin.on('initError', (error: any) => setError(error)),
      plugin.on('animationStart', () => setBusy(true)),
      plugin.on('encodingStart', () => setBusy(true)),
      plugin.on('encodingFinished', () => setBusy(false))
    ].flat();

    return () => {
      unsubscribe.forEach(fn => fn());

      clear();
    }
  }, [plugin]);

  return { plugin, busy, initialized, downloading, downloadProgress, error };

}