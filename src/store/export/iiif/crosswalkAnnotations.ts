import { Store } from '@/store';
import { serializePropertyValue } from '@/utils/serialize';
import { 
  FragmentSelector, 
  W3CAnnotation, 
  W3CAnnotationBody, 
  W3CImageAnnotation, 
  W3CImageAnnotationTarget, 
  W3CImageSelector 
} from '@annotorious/annotorious';

// Simplified test, because we can rely on Annotorious-generated annotations
export const isFragmentSelector = (s?: W3CImageSelector): s is FragmentSelector =>
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

const toHTMLBody = (b: W3CAnnotationBody, store: Store) => {
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

export const crosswalkAnnotations = (annotations: W3CAnnotation[], store: Store): W3CImageAnnotation[] => {
  return annotations.map(a => {
    const target = (Array.isArray(a.target) ? a.target[0] : a.target) as W3CImageAnnotationTarget;
    const canvas = store.getCanvas(target.source); 

    const selector = target.selector as W3CImageSelector;

    const normalized = isFragmentSelector(selector) ? {
      ...selector,
      value: normalizeFragmentSelector(selector.value)
    } : selector;

    return {
      ...a,
      motivation: 'commenting', // Mirador ignores annotations without this!
      body: Array.isArray(a.body) ? a.body.map(b => toHTMLBody(b, store)) : toHTMLBody(a.body, store),
      target: {
        ...target,
        selector: normalized,
        source: canvas?.uri || target.source
      }
    }
  }).filter(Boolean);
}