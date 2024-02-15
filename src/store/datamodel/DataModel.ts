import { EntityType, MetadataSchema } from '@/model';

export interface DataModel {

  entityTypes: EntityType[];

  folderSchemas: MetadataSchema[];
  
  imageSchemas: MetadataSchema[];

}
