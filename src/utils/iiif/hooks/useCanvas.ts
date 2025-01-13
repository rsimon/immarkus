import { useMemo } from 'react';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { useStore } from '@/store';
import { parseIIIFId } from '../utils';

export const useCanvas = (id: string): CanvasInformation => {

  const store = useStore();

  const canvas = useMemo(() => {
    if (!store) return;

    const [manifestId, canvasId] = parseIIIFId(id);

    const manifest = store.getIIIFResource(manifestId) as IIIFManifestResource;
    return manifest.canvases.find(c => c.id === canvasId);
  }, [store, id]);

  return canvas;

}