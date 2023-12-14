import { EntityType } from './EntityType';
import { Tag } from './Tag';

export interface DataModel { 
  
  entityTypes: EntityType[];

  tags: Tag[];

  // imageMetadataSchema: PropertyDefinition[];

  // folderMetadataSchema: PropertyDefinition[];

}
