import { ImageMetadataSchema } from '@/model/MetadataSchema';
import { EntityType } from '../../model/EntityType';
import { FolderMetadataSchema } from '@/model/FolderMetadataSchema';

export interface DataModel {

  entityTypes: EntityType[];

  folderSchemas: FolderMetadataSchema[];
  
  imageSchemas: ImageMetadataSchema[];

}
