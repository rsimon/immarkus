import murmur from 'murmurhash';
import { CozyCanvas } from 'cozy-iiif';
import { parseW3CImageAnnotation, serializeW3CImageAnnotation } from '@annotorious/react';
import type { W3CImageAnnotation } from '@annotorious/react';

export const importAnnotations = (manifestId: string, canvases: CozyCanvas[]): W3CImageAnnotation[] =>
  canvases.reduce<W3CImageAnnotation[]>((all, canvas) => {
    if ((canvas.annotations || []).length > 0) {
      const canvasId = murmur.v3(canvas.id).toString();

      const annotations = canvas.annotations
        // Flatten annotation pages
        .flatMap(p => (p.items || []))
        .reduce<W3CImageAnnotation[]>((all, orig) => {
          // Normalize annotations by "double"-crosswalking them
          const parsed = parseW3CImageAnnotation(orig as W3CImageAnnotation).parsed;
          if (parsed) {
            const normalized = serializeW3CImageAnnotation(parsed, `iiif:${manifestId}:${canvasId}`);
            return [...all, normalized];
          } else {
            return all;
          }
        }, []);

      return [...all, ...annotations];
    } else {
      return all;
    }
  }, []);