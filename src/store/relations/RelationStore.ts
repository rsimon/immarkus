import { AnnotationStore } from '../Store';
import { readJSONFile, writeJSONFile } from '../utils';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from './W3CRelationAnnotation';

export interface RelationStore {

  deleteRelation(relationId: string, imageId?: string): Promise<void>;

  getRelations(imageId: string): Promise<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][]>;

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
          .map(link => ([
            link, 
            annotations
              .find(a => a.motivation === 'tagging' && a.target === link.id) as W3CRelationMetaAnnotation
            ]) as [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation]);
      });

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
    getRelations,
    upsertRelation
  });

});