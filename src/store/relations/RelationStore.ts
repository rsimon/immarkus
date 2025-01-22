import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { CanvasInformation, IIIFManifestResource, IIIFResource, Image } from '@/model';
import { AnnotationStore } from '../Store';
import { readJSONFile, writeJSONFile } from '../utils';

export type Directionality = 'INBOUND' | 'OUTBOUND';

export interface RelationStore {

  deleteRelation(linkId: string): Promise<void>;

  getRelatedAnnotations(annotationId: string, direction?: Directionality): [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][];

  getRelatedImageAnnotations(sourceId: string): Promise<{ [image: string]: string[] }>;

  getRelationAnnotation(annotationId: string): W3CRelationLinkAnnotation | W3CRelationMetaAnnotation | undefined;

  getRelations(imageId: string, direction?: Directionality): Promise<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][]>;

  hasRelatedAnnotations(annotationId: string): boolean;

  listAllRelations(): [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][];

  removeIIIFResource(resource: IIIFResource): Promise<void>;

  upsertRelation(link: W3CRelationLinkAnnotation, meta: W3CRelationMetaAnnotation, imageId?: string): Promise<void>;

}

export const loadRelationStore = (
  handle: FileSystemDirectoryHandle,
  store: AnnotationStore
): Promise<RelationStore> => new Promise(async resolve => {

  const fileHandle = await handle.getFileHandle('_immarkus.relations.json', { create: true });
  
  const file = await fileHandle.getFile();

  let annotations: (W3CRelationLinkAnnotation | W3CRelationMetaAnnotation)[] = 
    await readJSONFile<[]>(file).then(data => (data || [])).catch(() => ([]));

  const save = () => writeJSONFile(fileHandle, annotations);

  const deleteRelation = (linkId: string) => {
    annotations = annotations.filter(a => !(a.id === linkId || a.target === linkId));
    return save();
  }

  const getMetaAnnotation = (linkId: string) =>
    annotations.find(a => a.motivation === 'tagging' && a.target === linkId) as W3CRelationMetaAnnotation;
    
  const getRelatedAnnotations = (annotationId: string, direction?: Directionality) => {
    // All connected link annotations
    const links = annotations.filter(a =>
      a.motivation === 'linking' && (
        direction === 'OUTBOUND' ? a.target === annotationId :
        direction === 'INBOUND' ? a.body === annotationId :
          (a.body === annotationId || a.target === annotationId)
      ));

    return links.map(link => ([ link, getMetaAnnotation(link.id) ]) as [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation]);
  }

  const getRelations = (imageId: string, direction?: 'INBOUND' | 'OUTBOUND') =>
    store.getAnnotations(imageId, { type: 'image' })
      .then(imageAnnotations => {
        // IDs of all image annotations on this image
        const imageAnnotationIds = new Set(imageAnnotations.map(a => a.id));

        // All link annotations to or from image annotations on this image
        const links = annotations
          .filter(a => 
            a.motivation === 'linking' && (
              direction === 'INBOUND' ? imageAnnotationIds.has(a.body) :
              direction === 'OUTBOUND' ? imageAnnotationIds.has(a.target) :
                (imageAnnotationIds.has(a.body) || imageAnnotationIds.has(a.target))
            )) as W3CRelationLinkAnnotation[];

        return links
          .map(link => ([ link, getMetaAnnotation(link.id) ]) as [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation]);
      });

  const getRelatedImageAnnotations = (imageId: string) =>
    getRelations(imageId).then(relations => {
      // Get all distinct target & source annotation IDs
      const annotationIds = 
        new Set(relations.reduce<string[]>((ids, [link, _]) => [...ids, link.body, link.target], []));

      const getSourceId = (source: Image | CanvasInformation) =>
        'uri' in source ? `iiif:${source.manifestId}:${source.id}` : source.id;

      return Promise.all([...annotationIds].map(annotation => store.findImageForAnnotation(annotation)
        .then(source => ({ annotation, source }))))
        .then(result => {
          // From a list tuples annotation/image, aggregate to a map image -> annotations
          const sourceIds = new Set(result.map(t => getSourceId(t.source)));

          const entries = [...sourceIds].map(sourceId => ([
            sourceId, 
            (result.filter(t => getSourceId(t.source) === sourceId) || []).map(t => t.annotation)
          ])) as [string, string[]][];

          return Object.fromEntries(entries);
        });
    });

  const getRelationAnnotation = (id: string) =>
    annotations.find(a => a.id === id); 

  const hasRelatedAnnotations = (annotationId: string) =>
    annotations.some(a => a.motivation === 'linking' && (a.body === annotationId || a.target === annotationId));

  const listAllRelations = () => {
    const links = annotations.filter(a => a.motivation === 'linking');
    return links.map(link => ([link, getMetaAnnotation(link.id)]) as [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation]);
  }

  const upsertRelation = (
    link: W3CRelationLinkAnnotation | undefined, 
    meta: W3CRelationMetaAnnotation | undefined
  ) => {
    const toUpsert = [link, meta].filter(Boolean);
    if (toUpsert.length === 0) return;

    const idsToUpsert = new Set(toUpsert.map(a => a.id));

    annotations = [
      ...annotations.filter(a => !idsToUpsert.has(a.id)),
      ...toUpsert
    ];

    return save();
  }

  // Not great...
  const _removeIIIFResource = store.removeIIIFResource;

  const removeIIIFResource = async (resource: IIIFResource) => {
    const { canvases } = (resource as IIIFManifestResource);

    // Get all relations to/from any of these canvases
    return canvases
      .reduce<Promise<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][]>>((p, canvas) => (
        p.then(all => {
          const id = `iiif:${canvas.manifestId}:${canvas.id}`;
          return getRelations(id).then(relations => ([...all, ...relations]));
        })
      ), Promise.resolve([]))
      .then(toDelete => {
        const linkIds = new Set<string>(toDelete.map(([link, _]) => link.id));
        annotations = annotations.filter(a => !(linkIds.has(a.id) || linkIds.has(a.target)));
        return save();
      })
      .then(() => _removeIIIFResource(resource));
  }

  resolve({
    deleteRelation,
    getRelatedAnnotations,
    getRelatedImageAnnotations,
    getRelationAnnotation,
    getRelations,
    hasRelatedAnnotations,
    listAllRelations,
    removeIIIFResource,
    upsertRelation
  });

});