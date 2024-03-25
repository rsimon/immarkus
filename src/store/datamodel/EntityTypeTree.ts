import Fuse from 'fuse.js';
import { EntityType } from '@/model';

export interface EntityTypeTree {

  getAncestors(type: EntityType): EntityType[];

  getChildTypes(id: string): EntityType[];

  getDescendants(typeOrId: EntityType | string): EntityType[];

  getRootTypes(): EntityType[];

  hasChildTypes(id: string): boolean;

  rebuild(types: EntityType[]): void;

  searchEntityTypes(query: string, limit?: number): EntityType[];

  searchEntityTypeBranch(query: string, parentId: string, limit?: number): EntityType[];

}

interface IndexedEntityType extends EntityType {

  parents: string[];

}

export const createEntityTypeTree = (entityTypes: EntityType[]): EntityTypeTree => {

  let types: EntityType[] = entityTypes;

  let fuse: Fuse<IndexedEntityType> | undefined;

  const getChildTypes = (id: string) => 
    types.filter(type => type.parentId === id);

  const findEntityType = (id: string) =>
    types.find(type => type.id === id);

  const getRootTypes = (): EntityType[] =>
    types.filter(type => !type.parentId);

  const hasChildTypes = (id: string) =>
    getChildTypes(id).length > 0;

  const walkAncestors = (type: EntityType, ancestors: EntityType[] = []): EntityType[] => {
    if (!type?.parentId)
      return ancestors;

    const parent = findEntityType(type.parentId);
    return parent ? walkAncestors(parent, [parent, ...ancestors]) : ancestors;
  }

  const getAncestors = (type: EntityType) => walkAncestors(type);

  const walkDescendants = (typeId: string, descendants: EntityType[] = []): EntityType[] => {
    const children = types.filter(type => type.parentId === typeId);
    return children.reduce<EntityType[]>((all, child) => {
      return walkDescendants(child.id, [...all, child])
    }, descendants);
  }

  const getDescendants = (typeOrId: EntityType | string) => {
    const start = typeof typeOrId === 'string' ? findEntityType(typeOrId) : typeOrId;
    return walkDescendants(start.id, [start]);
  }

  const searchEntityTypes = (query: string, limit?: number): EntityType[] =>
    fuse.search(query, { limit: limit || 10 })
      .filter(r => r.score < 0.2)
      .map(r => { 
        const { parents, ...type } = r.item;
        return type;
      });

  const searchEntityTypeBranch = (query: string, parentId: string, limit?: number): EntityType[] =>
    fuse.search({
      $and: [{ parents: `=${parentId}`}, { id: query }]
    }, {
      limit: limit || 10
    })
    .filter(r => r.score < 0.6)
    .map(r => {
      const { parents, ...type } = r.item;
      return type;
    });

  const rebuild = (entityTypes: EntityType[]) => {
    types = entityTypes;
    
    // Determine ancestry path for each record, so we can search by parent efficiently
    const records: IndexedEntityType[] = types.map(type => {
      const parents = walkAncestors(type).map(t => t.id);
      return {...type, parents };
    });

    fuse = new Fuse<IndexedEntityType>(records, { 
      keys: [ 'id', 'label', 'description', 'parents' ],
      shouldSort: true,
      threshold: 0.6,
      includeScore: true,
      useExtendedSearch: true
    });
  }

  // Initial index build
  rebuild(types);

  return {
    getAncestors,
    getChildTypes,
    getDescendants,
    getRootTypes,
    hasChildTypes,
    rebuild,
    searchEntityTypes,
    searchEntityTypeBranch
  }

}