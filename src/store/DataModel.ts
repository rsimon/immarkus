import { EntityType } from '../model/EntityType';
import { Tag } from '../model/Tag';

export interface DataModel { 
  
  entityTypes: EntityType[];

  tags: Tag[];

  // imageMetadataSchema: PropertyDefinition[];

  // folderMetadataSchema: PropertyDefinition[];

}
