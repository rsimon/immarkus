import { useMemo } from 'react';
import murmur from 'murmurhash';
import { CozyCanvas } from '@/utils/cozy-iiif';
import { useIIIFResource } from './useIIIFResource';

export const useCanvas = (id?: string): CozyCanvas => {

  if (!id || !id.startsWith('iiif:')) return;

  const [manifestId, canvasId] = id.substring('iiif:'.length).split(':');

  if (!manifestId && !canvasId) return;
  
  const manifest = useIIIFResource(manifestId);

  const canvas = useMemo(() => {
    if (!manifest) return;
    return manifest.canvases.find(c => murmur.v3(c.id).toString() === canvasId);
  }, [id, manifest]);

  return canvas;

}