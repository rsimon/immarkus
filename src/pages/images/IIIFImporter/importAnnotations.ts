import murmur from 'murmurhash';
import { CozyCanvas } from 'cozy-iiif';
import { parseW3CImageAnnotation, serializeW3CImageAnnotation } from '@annotorious/react';
import type { AnnotationBody, W3CImageAnnotation } from '@annotorious/react';

export const validateAnnotations = (canvases: CozyCanvas[]) => {
  const annotations = canvases.reduce<any[]>((all, canvas) => {
    if ((canvas.annotations || []).length > 0) {
      const annotations = canvas.annotations.flatMap(p => (p.items || []));
      return [...all, ...annotations];
    } else {
      return all;
    }
  }, []);

  const valid = annotations
    .map(orig => parseW3CImageAnnotation(orig as W3CImageAnnotation))
    .filter(t => t.parsed && !t.error);

  return { total: annotations.length, valid: valid.length };
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

export const crosswalkAnnotations = (manifestId: string, canvases: CozyCanvas[]): W3CImageAnnotation[] =>
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
            const crosswalked = {
              ...parsed,
              bodies: crosswalkAnnotationBody(parsed.bodies)
            };

            const normalized = serializeW3CImageAnnotation(crosswalked, `iiif:${manifestId}:${canvasId}`);
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