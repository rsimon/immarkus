import { PropertyDefinition } from '@/model';
import { ExternalAuthority } from '@/model/ExternalAuthority';

export type PropertyDefinitionStub = {

  name?: string, 

  description?: string,

  size?: 'L',

  type?: PropertyDefinition['type'],

  required?: boolean,

  multiple?: boolean,

  authorities?: ExternalAuthority[],

  values?: string[]

}