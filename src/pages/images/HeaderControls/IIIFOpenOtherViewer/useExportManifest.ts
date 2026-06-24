import { useCallback } from 'react';
import { importAnnotations } from 'cozy-iiif/helpers';
import { W3CAnnotationTarget } from '@annotorious/react';
import type { FragmentSelector, W3CAnnotationBody, W3CImageSelector }  from '@annotorious/annotorious';
import { IIIFManifestResource } from '@/model';
import { Store, useAnnotations, useStore } from '@/store';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { serializePropertyValue } from '@/utils/serialize';

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

export const useExportManifest = (manifest: IIIFManifestResource) => {
  const store = useStore();
  const resource = useIIIFResource(manifest.id);
  const annotations = useAnnotations(`iiif:${manifest.id}`, { type: 'both' });

  const exportManifest = useCallback(() => {
    const crosswalked = annotations.map(a => {
      const target = (Array.isArray(a.target) ? a.target[0] : a.target) as W3CAnnotationTarget;
      const canvas = store.getCanvas(target.source);

      if (!canvas) {
        console.warn(`Canvas not found for source ${target.source}`);
        return;
      }

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
          source: canvas.uri
        }
      }
    }).filter(Boolean);

    const derivative = importAnnotations(resource, crosswalked as any[]);

    const str = JSON.stringify(derivative.source);
    const data = new TextEncoder().encode(str);
    const blob = new Blob([data], {
      type: 'application/json;charset=utf-8'
    });

    const anchor = document.createElement('a');

    const url = URL.createObjectURL(blob);
    anchor.href = url;
    anchor.download = 'manifest.json';
    anchor.click();
    URL.revokeObjectURL(url);    
  }, [resource, annotations, store]);

  return exportManifest;
}