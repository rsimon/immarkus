import { ConnectionAnnotation, W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { AnnotationStore } from '../Store';
import { readJSONFile, writeJSONFile } from '../utils';

export const isConnectionAnnotation = (arg: any): arg is ConnectionAnnotation => 
  arg.motivation !== undefined && arg.motivation === 'linking';

export const isW3CRelationLinkAnnotation = (arg: any): arg is W3CRelationLinkAnnotation =>
  arg.motivation !== undefined && 
  arg.motivation === 'linking' &&
  arg.body !== undefined && 
  arg.target !== undefined &&
  typeof arg.body === 'string' && 
  typeof arg.target === 'string';

export const isW3CRelationMetaAnnotation = (arg: any): arg is W3CRelationMetaAnnotation =>
  (arg.motivation === undefined || arg.motivation === 'tagging') &&
   typeof arg.target === 'string';

export interface RelationStore {

  deleteRelation(relationId: string, imageId?: string): Promise<void>;

  getRelatedAnnotations(annotationId: string): [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][];

  getRelations(imageId: string): Promise<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][]>;

  hasRelatedAnnotations(annotationId: string): boolean;

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

  const deleteRelation = (relationId: string, imageId?: string) => {
    annotations = annotations.filter(a => !(a.id === relationId || a.target === relationId));
    return save();
  }

  const getMetaAnnotation = (linkId: string) =>
    annotations.find(a => a.motivation === 'tagging' && a.target === linkId) as W3CRelationMetaAnnotation;
    
  const getRelatedAnnotations = (annotationId: string) => {
    // All connected link annotations
    const links = annotations.filter(a =>
      a.motivation === 'linking' && (a.body === annotationId || a.target === annotationId));

    return links.map(link => ([ link, getMetaAnnotation(link.id) ]) as [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation]);
  }

  const getRelations = (imageId: string) =>
    store.getAnnotations(imageId, { type: 'image' })
      .then(imageAnnotations => {
        // IDs of all image annotations on this image
        const imageAnnotationIds = new Set(imageAnnotations.map(a => a.id));

        // All link annotations to or from image annotations on this image
        const links = annotations
          .filter(a => 
            a.motivation === 'linking' && (
              imageAnnotationIds.has(a.body) || imageAnnotationIds.has(a.target)
            )) as W3CRelationLinkAnnotation[];

        return links
          .map(link => ([ link, getMetaAnnotation(link.id) ]) as [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation]);
      });

  const hasRelatedAnnotations = (annotationId: string) =>
    annotations.some(a => a.motivation === 'linking' && (a.body === annotationId || a.target === annotationId));

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
    getRelations,
    hasRelatedAnnotations,
    upsertRelation
  });

});