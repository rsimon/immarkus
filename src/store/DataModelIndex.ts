import Fuse from 'fuse.js';
import { EntityType } from '@/model';

export interface EntityTypeIndex {

  searchEntityTypes(query: string): EntityType[];

}

export const createEntityTypeIndex = (entityTypes: EntityType[]): EntityTypeIndex => {

  const fuse = new Fuse<EntityType>(entityTypes, { keys: [ 'id', 'label', 'description' ]})

  const searchEntityTypes = (query: string) =>
    fuse.search(query).map(r => r.item);

  return { searchEntityTypes }

}