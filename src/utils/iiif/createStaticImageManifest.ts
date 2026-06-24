import { LoadedFileImage } from '@/model';
import { Store } from '@/store';
import { serializePropertyValue } from '../serialize';
import { 
  FragmentSelector, 
  W3CAnnotation, 
  W3CAnnotationBody, 
  W3CAnnotationTarget, 
  W3CImageSelector 
} from '@annotorious/annotorious';

const BASE_URL = 'http://localhost:4173/images';

/**
 * Simplified test, because we can rely on Annotorious-generated annotations
 */
const isFragmentSelector = (s?: W3CImageSelector): s is FragmentSelector =>
  s && 'type' in s && s.type === 'FragmentSelector';

/**
 * Make Mirador happy: no 'pixel:' format prefix. And round coordinates
 * while we're at it.
 */
const normalizeFragmentSelector = (selector: string) => {
  const match = selector.match(
    /^xywh=(?:([a-z]+):)?(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);

  if (!match)
    throw new Error(`Invalid FragmentSelector: "${selector}"`);

  // match[1] is the optional format prefix (e.g. "pixel", "percent")
  const [x, y, w, h] = match.slice(2).map((v) => Math.round(Number(v)));
  return `xywh=${x},${y},${w},${h}`;
}

const escapeHtml = (s: unknown): string =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const crosswalkBody = (b: W3CAnnotationBody, store: Store) => {
  const model = store.getDataModel();

  if (b.purpose !== 'classifying')
    return { id: b.id, type: 'TextualBody', format: 'text/plain', value: b.value };
  
  const entityType = model.getEntityType(b.source);

  if (!entityType) {
    console.warn(`Unknown entity type: ${b.source}`);
    return { id: b.id, type: 'TextualBody', format: 'text/plain', value: b.value };
  }

  const entries = 'properties' in b ? Object.entries(b.properties).map(([key, val]) => {
    const prop = (entityType.properties || []).find(p => p.name === key);
    if (prop) {
      return [key, serializePropertyValue(prop, val)];
    } else {
      return [key, val];
    }
  }) : [];

  const html = `<div>${entries.map(([key, val]) => 
`<p><strong>${escapeHtml(key)}</strong>:<span>${escapeHtml(val)}</span></p>`
).join('')}</div>`
    
  return {
    id: b.id,
    type: 'TextualBody',
    format: 'text/html',
    value: html
  }
}

const getImageDimensions = (blob: Blob): Promise<{ width: number, height: number }> => 
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });

const crosswalkAnnotations = (annotations: W3CAnnotation[], store: Store) => {
  return annotations.map(a => {
    const target = (Array.isArray(a.target) ? a.target[0] : a.target) as W3CAnnotationTarget;
    const canvas = store.getCanvas(target.source); 

    const selector = target.selector as W3CImageSelector;

    const normalized = isFragmentSelector(selector) ? {
      ...selector,
      value: normalizeFragmentSelector(selector.value)
    } : selector;

    return {
      ...a,
      motivation: 'commenting', // Mirador ignores annotations without this!
      body: Array.isArray(a.body) ? a.body.map(b => crosswalkBody(b, store)) : crosswalkBody(a.body, store),
      target: {
        ...target,
        selector: normalized,
        source: canvas?.uri || target.source
      }
    }
  }).filter(Boolean);
}

export const createStaticImageManifest = (image: LoadedFileImage, store: Store) =>
  getImageDimensions(image.data).then(({ width, height }) => {
    return store.getAnnotations(image.id, { type: 'both' }).then(annotations => {
      const crosswalked = crosswalkAnnotations(annotations, store);

      const source = {
        '@context': 'http://iiif.io/api/presentation/3/context.json',
        id: `${BASE_URL}/${image.id}/manifest.json`,
        type: 'Manifest',
        label: {
          en: [ image.name ],
        },
        items: [
          {
            id: `${BASE_URL}/${image.id}/canvas/1`,
            type: 'Canvas',
            height,
            width,
            items: [
              {
                id: `${BASE_URL}/${image.id}/page/p1/1`,
                type: 'AnnotationPage',
                items: [
                  {
                    id: `${BASE_URL}/${image.id}/annotation/p0001-image`,
                    type: 'Annotation',
                    motivation: 'painting',
                    body: {
                      id: `${BASE_URL}/${image.file.name}`,
                      type: 'Image',
                      format: 'image/png',
                      height,
                      width
                    },
                    target: `${BASE_URL}/${image.id}/canvas/1`
                  }
                ]
              }
            ],
            annotations: [
              {
                id: `${BASE_URL}/${image.id}/page/p2/1`,
                type: 'AnnotationPage',
                items: crosswalked
              }
            ]
          }
        ]
      }

      return source;
    })
  });