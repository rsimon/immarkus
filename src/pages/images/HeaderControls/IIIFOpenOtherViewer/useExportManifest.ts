import { useCallback } from 'react';
import { importAnnotations } from 'cozy-iiif/helpers';
import { IIIFManifestResource } from '@/model';
import { useAnnotations, useStore } from '@/store';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { W3CAnnotationTarget } from '@annotorious/react';

export const useExportManifest = (manifest: IIIFManifestResource) => {

  const store = useStore();

  const resource = useIIIFResource(manifest.id);

  const annotations = useAnnotations(`iiif:${manifest.id}`, { type: 'both' });

  const exportManifest = useCallback(() => {
    // console.log(resource);
    const crosswalked = annotations.map(a => {
      const target = (Array.isArray(a.target) ? a.target[0] : a.target) as W3CAnnotationTarget;
      const canvas = store.getCanvas(target.source);
      return {
        ...a,
        target: {
          ...target,
          source: canvas.uri
        }
      }
    })

    // @ts-ignore
    const derivative = importAnnotations(resource, crosswalked);

    const str = JSON.stringify(derivative.source);
    const data = new TextEncoder().encode(str);
    const blob = new Blob([data], {
      type: 'application/json;charset=utf-8'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'manifest.json';
    anchor.click();
  }, [resource, annotations, store]);

  return exportManifest;

}