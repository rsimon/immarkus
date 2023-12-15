import { ExternalAuthority } from './ExternalAuthority';

type BasePropertyDefinition = {

  name: string, 

  description?: string; 
  
  inheritedFrom?: string;

  required?: boolean,

  multiple?: boolean;

}

export type PrimitivePropertyDefinition = BasePropertyDefinition & {

  type: 'geocoordinate' 
    | 'measurement'
    | 'number'
    | 'text'
    | 'uri'

}

export type EnumPropertyDefinition = BasePropertyDefinition & {

  type: 'enum',

  values: string[]

}

export type ExternalAuthorityPropertyDefinition = BasePropertyDefinition & {

  type: 'external_authority',

  authorities: ExternalAuthority[];

}

export type PropertyDefinition = PrimitivePropertyDefinition | EnumPropertyDefinition;


