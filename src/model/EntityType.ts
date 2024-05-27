import { PropertyDefinition } from './PropertyDefinition';

export interface EntityType {

  id: string;

  color?: string;

  label?: string;

  parentId?: string;

  description?: string;

  properties?: PropertyDefinition[];

}

