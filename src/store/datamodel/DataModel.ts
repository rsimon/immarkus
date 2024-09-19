import { EntityType, MetadataSchema } from '@/model';

export interface DataModel {

  entityTypes: EntityType[];

  relationshipTypes: string[];

  folderSchemas: MetadataSchema[];
  
  imageSchemas: MetadataSchema[];

}
