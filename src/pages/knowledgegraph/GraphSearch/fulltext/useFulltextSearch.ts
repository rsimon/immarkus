import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import type { W3CAnnotation } from '@annotorious/react';
import { CozyManifest } from 'cozy-iiif';
import { IIIFManifestResource, IIIFResource, PropertyDefinition } from '@/model';
import { useStore } from '@/store';
import { fetchManifest } from '@/utils/iiif';
import { serializePropertyValue } from '@/utils/serialize';
import { Graph } from '../../Types';
import { useFailedManifestToast } from '../../useFailedManifestToast';
import { normalizeString } from '../searchUtils';

export type RecordFieldType = 
  | 'IMAGE_NAME' 
  | 'IMAGE_ANNOTATION'
  | 'IMAGE_METADATA' 
  | 'FOLDER_NAME'
  | 'FOLDER_METADATA'
  | 'IIIF_MANIFEST_METADATA'
  | 'IIIF_CANVAS_METADATA';

export interface IndexedRecord { 

  nodeId: string;

  fieldType: RecordFieldType;

  fieldKey?: string;

  fieldValue: string;

}

export interface SearchResult {

  hits: IndexedRecord[];

  counts: Partial<Record<RecordFieldType, number>>;

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

const buildManifestIndexRecords = (manifest: CozyManifest, downloadURL: string, resources: IIIFResource[]): IndexedRecord[] => {
  const resource = resources.find(r => r.uri === downloadURL);
  if (!resource) {
    console.warn(`IIIF manifest integrity error: ${manifest.id}`);
    return [];
  }

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

  const { t } = useTranslation('knowledgegraph');
  
  const showFailedManifestToast = useFailedManifestToast();

  const model = store.getDataModel();

  const [initializing, setInitializing] = useState(true);
  const [warning, setWarning] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const [index, setIndex] = useState<Fuse<IndexedRecord>>(undefined);

  useEffect(() => {
    try {
      setInitializing(true);
      setWarning(undefined);
      setError(undefined);

      const startTime = performance.now();
      console.log(`Building fulltext index for ${graph.nodes.length} nodes`);

      // Node filenames
      const nodeNameRecords = graph.nodes.map(node => ({
        nodeId: node.id,
        fieldType: node.type === 'IMAGE' ? 'IMAGE_NAME' : 'FOLDER_NAME',
        fieldValue: node.label
      } as IndexedRecord));

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
        ];
      }, []);

    const pFolderRecords = () => Promise.all(store.folders.map(folder => {
      return store.getFolderMetadata(folder.handle).then(meta => {
        return meta ? getProperties(meta, model.folderSchemas.map(({ name, properties }) => ({ id: name, properties })))
          .map(([key, val]) => ({
            nodeId: folder.id,
            fieldType: 'FOLDER_METADATA',
            fieldKey: key,
            fieldValue: val
          } as IndexedRecord)) : [];
      });
    })).then(nested => nested.flat());
      const manifestUrls = store.iiifResources.map(r => r.uri);
      const failedToFetch: string[] = [];

      const fetchManifests = manifestUrls.reduce<Promise<{ url: string, manifest: CozyManifest}[]>>((promise, url) => promise.then(all => (
        fetchManifest(url)
          .then((manifest: CozyManifest) => ([...all, { url, manifest }]))
          .catch(error => {
            console.error(error);
            failedToFetch.push(url);
            return all;
          })
      )), Promise.resolve([]));

      const pIIIFRecords = () => fetchManifests.then(manifests => {
        return manifests.flatMap(m => {
          return buildManifestIndexRecords(m.manifest, m.url, store.iiifResources);
        })
      });

      pFolderRecords().then(folderRecords => {
        pIIIFRecords().then(iiifRecords => {
          const all = [...nodeNameRecords, ...imageRecords, ...folderRecords, ...iiifRecords];

          if (failedToFetch.length > 0) {
            setWarning(t('graphSearch.error.fetchFailed', { failed: failedToFetch.length, count: manifestUrls.length }));
            console.warn(`Failed to fetch the following manifests:\n${failedToFetch.join('\n')}`);
            showFailedManifestToast(failedToFetch, manifestUrls.length);
          }

          setIndex(buildIndex(all));
          setInitializing(false);

          console.log(`Took ${performance.now() - startTime}ms`);
        }).catch(error => {
          console.error(error);
          setInitializing(false);
          setError(t('graphSearch.error.manifestParseError'));
        });
      }).catch(error => { 
        setInitializing(false);
        setError(error.message);
      });
    } catch (error) {
      setInitializing(false);
      setError(error.message);
    }
  }, [annotations, showFailedManifestToast, store, t]);

  const search = useCallback((query: string): SearchResult => {
    if (!index) return { hits: [], counts: {} };

    const hits = index.search(query)
      .filter(r => r.score < 0.1)
      .map(r => r.item);

    const counts = hits.reduce<Partial<Record<RecordFieldType, number>>>((all, hit) => {
      all[hit.fieldType] = (all[hit.fieldType] ?? 0) + 1;
      return all;
    }, {});

    return { hits, counts };
  }, [index]);

  return { search, warning, error, initializing };

}