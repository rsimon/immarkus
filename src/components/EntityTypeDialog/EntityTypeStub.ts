import { PropertyDefinition } from '@/model';

export interface EntityTypeStub {

  id?: string;

  color?: string;

  label?: string;

  parentId?: string;

  description?: string;

  properties?: PropertyDefinition[];

}