import murmur from 'murmurhash';
import { CozyCanvas } from 'cozy-iiif';
import { fetchAnnotations } from 'cozy-iiif/helpers';
import { parseW3CImageAnnotation, serializeW3CImageAnnotation } from '@annotorious/react';
import type { AnnotationBody, W3CImageAnnotation } from '@annotorious/react';
import { isCanvasAnnotation } from '@/utils/iiif';

export interface AnnotationValidationResult {

  total: number;

  canvasAnnotations: number;

  shapeAnnotations: number;

  failed: number;

}

export const validateAnnotations = (canvases: CozyCanvas[]): Promise<AnnotationValidationResult> => {
  return canvases.reduce<Promise<any[]>>((p, canvas) => p.then(all => {
    return fetchAnnotations(canvas).then(onThisCanvas => {
      return [...all, ...onThisCanvas];
    });
  }), Promise.resolve([])).then(annotations => {
    const result = annotations.reduce<Partial<AnnotationValidationResult>>((result, annotation) => {
      if (isCanvasAnnotation(annotation)) {
        return { ...result, canvasAnnotations: result.canvasAnnotations + 1 };
      } else {
        try {
          const { parsed, error } = parseW3CImageAnnotation(annotation as W3CImageAnnotation);
          return (parsed && !error) ? 
            { ...result, shapeAnnotations: result.shapeAnnotations + 1 } :
            { ...result, failed: result.failed + 1 };
        } catch (error) {
          console.warn(error);
          console.warn('Could not parse annotation', annotation);
          return { ...result, failed: result.failed + 1 };
        }
      }
    }, { canvasAnnotations: 0, shapeAnnotations: 0, failed: 0 });

    return { 
      ...result, 
      total: result.canvasAnnotations + result.shapeAnnotations + result.failed
    } as AnnotationValidationResult;
  });
}

/**
 * This method will drop all bodies that are not plaintext or HTML format,
 * and concatenate all remaining to a single comment body.
 */
const crosswalkAnnotationBody = (bodies: AnnotationBody[]): AnnotationBody[] => {
  const crosswalkedValues = bodies.reduce<string[]>((all, body) => {
    // No body value, or body has a type that's not 'TextualBody'
    if (!body.value || (body.type && body.type !== 'TextualBody')) return all;

    if (!('format' in body) || body.format === 'text/plain') {
      // text/plain or no format - consider plaintext
      return [...all, body.value.toString()];
    } else if (body.format === 'text/html') {
      // Strip HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(body.value, 'text/html');
      return [...all, doc.body.innerText];
    } else {
      return all;
    }
  }, []);

  return [{
    type: 'TextualBody',
    purpose: 'commenting',
    value: crosswalkedValues.join('\n---\n')
  } as AnnotationBody]
}

export const importAnnotations = (manifestId: string, canvases: CozyCanvas[]): Promise<W3CImageAnnotation[]> => 
  canvases.reduce<Promise<W3CImageAnnotation[]>>((p, canvas) => p.then(all => {
    return fetchAnnotations(canvas).then(onThisCanvas => {
      if (onThisCanvas.length > 0) {
        const canvasId = murmur.v3(canvas.id).toString();

        const normalized = onThisCanvas.reduce<W3CImageAnnotation[]>((all, orig) => {
          // Normalize annotations by "double"-crosswalking them
          try {
            const parsed = parseW3CImageAnnotation(orig as W3CImageAnnotation).parsed;
            if (parsed) {
              const crosswalked = {
                ...parsed,
                bodies: crosswalkAnnotationBody(parsed.bodies)
              };

              const normalized = serializeW3CImageAnnotation(crosswalked, `iiif:${manifestId}:${canvasId}`);
              return [...all, normalized];
            } else {
              return all;
            }
          } catch {
            return all;
          }
        }, []);

        return [...all, ...normalized];
      } else {
        return all;
      }
    });
  }), Promise.resolve([]));