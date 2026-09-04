import { useCallback, useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import type { W3CAnnotation } from '@annotorious/react';
import { CozyManifest } from 'cozy-iiif';
import { IIIFManifestResource, IIIFResource, PropertyDefinition } from '@/model';
import { useStore } from '@/store';
import { fetchManifests } from '@/utils/iiif';
import { serializePropertyValue } from '@/utils/serialize';
import { Graph } from '../../Types';
import { normalizeString } from '../searchUtils';

export interface IndexedRecord { 

  nodeId: string;

  fieldType: 
    | 'NODE_NAME' 
    | 'IMAGE_ANNOTATION'
    | 'IMAGE_METADATA' 
    | 'FOLDER_METADATA' 
    | 'IIIF_MANIFEST_METADATA'
    | 'IIIF_CANVAS_METADATA';

  fieldKey?: string;

  fieldValue: string;

}

const getProperties = (a: W3CAnnotation, schemas: { id: string, properties?: PropertyDefinition[] }[]) => {
  return (Array.isArray(a.body) ? a.body : [a.body]).reduce<[string, string][]>((all, b) => {
    if (b.purpose === 'commenting') {
      return [...all, [undefined, b.value]];
    } else {
      if (!('properties' in b) || !b.source) return all;

      const schema = schemas.find(d => d.id === b.source)?.properties || [];

      const entries: [string, string][] = Object.entries(b.properties || {}).flatMap(([key, val]) => {
        const def = schema.find(def => def.name === key);
        const serialized = def ? serializePropertyValue(def, val) : JSON.stringify(val);
        return Array.isArray(serialized) ? serialized.map(val => ([key, val])) as [string, string][] : [[key, serialized]];
      });

      return [...all, ...entries];
    }
  }, []);
}

const buildManifestIndexRecords = (manifest: CozyManifest, resources: IIIFResource[]): IndexedRecord[] => {
  const resource = resources.find(r => r.uri === manifest.id);
  if (!resource) throw `IIIF manifest integrity error: ${manifest.id}`; // Should never happen

  const manifestRecords = manifest.getMetadata().map(({ label , value }) => ({
    nodeId: `iiif:${resource.id}`,
    fieldType: 'IIIF_MANIFEST_METADATA',
    fieldKey: normalizeString(label),
    fieldValue: normalizeString(value)
  } as IndexedRecord));

  const canvasRecords = manifest.canvases.flatMap(canvas => {
    const canvasId = (resource as IIIFManifestResource).canvases.find(c => c.uri === canvas.id)?.id;
    if (!canvasId) throw `IIIF canvas integrity error: ${canvas.id}`; // Should never happen

    return canvas.getMetadata().map(({ label, value }) => ({
      nodeId: `iiif:${resource.id}:${canvasId}`,
      fieldType: 'IIIF_CANVAS_METADATA',
      fieldKey: normalizeString(label),
      fieldValue: normalizeString(value)
    } as IndexedRecord));
  });

  return [...manifestRecords, ...canvasRecords];
}

const buildIndex = (records: IndexedRecord[]) => new Fuse<IndexedRecord>(records, { 
  keys: ['fieldValue'],
  shouldSort: true,
  ignoreLocation: true,
  threshold: 0.6,
  includeScore: true,
  useExtendedSearch: true
});

export const useFulltextSearch = (  
  annotations: { sourceId: string, annotations: W3CAnnotation[] }[],
  graph: Graph
) => {
  const store = useStore(); 

  const model = store.getDataModel();

  const [index, setIndex] = useState<Fuse<IndexedRecord>>(undefined);

  useEffect(() => {
    // Node filenames
    const nodeNameRecords = graph.nodes.map(node => ({
      nodeId: node.id,
      fieldType: 'NODE_NAME',
      fieldValue: node.label
    } as IndexedRecord))

    // Annotation property values: image annotations + image metadata
    const imageRecords = annotations.reduce<IndexedRecord[]>((all, { sourceId, annotations }) => {
      const imageAnnotations = 
        annotations.filter(a => typeof a.target !== 'string' && 'selector' in a.target);

      const metaAnnotations = 
        annotations.filter(a => typeof a.target !== 'string' && !('selector' in a.target));

      return [
        ...all, 
        ...imageAnnotations.flatMap(a => 
          getProperties(a, model.entityTypes)
            .map(([key, val]) => ({
              nodeId: sourceId,
              fieldType: 'IMAGE_ANNOTATION',
              fieldKey: key,
              fieldValue: val
            } as IndexedRecord))),
        ...metaAnnotations.flatMap(a => 
          getProperties(a, model.imageSchemas.map(({ name, properties }) => ({ id: name, properties })))
            .map(([key, val]) => ({
              nodeId: sourceId,
              fieldType: 'IMAGE_METADATA',
              fieldKey: key,
              fieldValue: val
            } as IndexedRecord)))
        // TODO add folder metadata
      ]
    }, []);

    const pFolderRecords = () => store.folders.reduce<Promise<IndexedRecord[]>>((p, folder) => p.then(all => {
      return store.getFolderMetadata(folder.handle).then(meta => {
        return meta ? [
          ...all, 
          ...getProperties(meta, model.folderSchemas.map(({ name, properties }) => ({ id: name, properties })))
            .map(([key, val]) => ({
              nodeId: folder.id,
              fieldType: 'FOLDER_METADATA',
              fieldKey: key,
              fieldValue: val
            } as IndexedRecord))
        ] : all;
      })
    }), Promise.resolve([]));

    const pIIIFRecords = () => fetchManifests(store.iiifResources.map(r => r.uri))
      .then(manifests => manifests.flatMap(m => buildManifestIndexRecords(m, store.iiifResources)));

    pFolderRecords().then(folderRecords => {
      pIIIFRecords().then(iiifRecords => {
        const all = [...nodeNameRecords, ...imageRecords, ...folderRecords, ...iiifRecords];
        setIndex(buildIndex(all));
      });
    });
  }, [annotations, store]);

  const search = useCallback((query: string) => {
    if (!index) return [];

    return index.search(query)
      .filter(r => r.score < 0.1)
      .map(r => r.item)
  }, [index]);

  return { search };

}