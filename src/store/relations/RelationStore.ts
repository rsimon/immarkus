import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { Image } from '@/model';
import { AnnotationStore } from '../Store';
import { readJSONFile, writeJSONFile } from '../utils';

export type Directionality = 'INBOUND' | 'OUTBOUND';

export interface RelationStore {

  deleteRelation(linkId: string): Promise<void>;

  getRelatedAnnotations(annotationId: string, direction?: Directionality): [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][];

  getRelatedImageAnnotations(imageId: string): Promise<{ [image: string]: string[] }>

  getRelations(imageId: string, direction?: Directionality): Promise<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][]>;

  hasRelatedAnnotations(annotationId: string): boolean;

  listAllRelations(): [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][];

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

      return Promise.all([...annotationIds].map(annotation => store.findImageForAnnotation(annotation)
        .then(image => ({ annotation, image }))))
        .then(result => {
          // From a list tuples annotation/image, aggregate to a map image -> annotations
          const imageIds = new Set(result.map(t => t.image.id));

          const entries = [...imageIds].map(imageId => ([
            imageId, 
            (result.filter(t => t.image.id === imageId) || []).map(t => t.annotation)
          ])) as [string, string[]][];

          return Object.fromEntries(entries);
        });
    });

  const hasRelatedAnnotations = (annotationId: string) =>
    annotations.some(a => a.motivation === 'linking' && (a.body === annotationId || a.target === annotationId));

  const listAllRelations = () => {
    const links = annotations.filter(a => a.motivation === 'linking');
    return links.map(link => ([link, getMetaAnnotation(link.id)]) as [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation]);
  }

  const upsertRelation = (
    link: W3CRelationLinkAnnotation, 
    meta: W3CRelationMetaAnnotation
    // imageId?: string // for future use
  ) => {
    annotations = [...annotations, link, meta];
    return save();
  }

  resolve({
    deleteRelation,
    getRelatedAnnotations,
    getRelatedImageAnnotations,
    getRelations,
    hasRelatedAnnotations,
    listAllRelations,
    upsertRelation
  });

});