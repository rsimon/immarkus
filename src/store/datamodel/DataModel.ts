import { EntityType, MetadataSchema, RelationshipType } from '@/model';

export interface DataModel {

  entityTypes: EntityType[];

  relationshipTypes: RelationshipType[];

  folderSchemas: MetadataSchema[];
  
  imageSchemas: MetadataSchema[];

}
