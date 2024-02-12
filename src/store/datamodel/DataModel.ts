import { ImageMetadataSchema } from '@/model/ImageMetadataSchema';
import { EntityType } from '../../model/EntityType';
import { FolderMetadataSchema } from '@/model/FolderMetadataSchema';

export interface DataModel {

  entityTypes: EntityType[];

  folderSchemas: FolderMetadataSchema[];
  
  imageSchemas: ImageMetadataSchema[];

}
