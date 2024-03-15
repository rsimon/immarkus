import { PropertyDefinition } from './PropertyDefinition';

export interface MetadataSchema {

  name: string;

  description?: string;
  
  properties?: PropertyDefinition[];

}

