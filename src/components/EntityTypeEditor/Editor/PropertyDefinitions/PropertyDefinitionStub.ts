import { PropertyDefinition } from '@/model';

export type PropertyDefinitionStub = {

  name?: string, 

  description?: string,

  type?: PropertyDefinition['type'],

  required?: boolean,

  multiple?: boolean,

  values?: string[]

}