import { readJSONFile, writeJSONFile } from '../utils';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from './W3CRelationAnnotation';

export interface RelationStore {

  deleteRelation(relationId: string, imageId?: string): Promise<void>;

  getRelations(imageId: string): Promise<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation | undefined][]>;

  upsertRelation(link: W3CRelationLinkAnnotation, meta: W3CRelationMetaAnnotation, imageId?: string): Promise<void>;

}

export const loadRelationStore = (
  handle: FileSystemDirectoryHandle
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

  const getRelations = (imageId: string) => {
    return Promise.resolve([]);
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
    getRelations,
    upsertRelation
  });

});