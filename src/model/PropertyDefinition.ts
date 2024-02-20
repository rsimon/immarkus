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
    | 'uri'

}

export type EnumPropertyDefinition = BasePropertyDefinition & {

  type: 'enum',

  values: string[]

}

export type ExternalAuthorityPropertyDefinition = BasePropertyDefinition & {

  type: 'external_authority',

  authorities: string[];

}

export type TextPropertyDefinition = BasePropertyDefinition & {

  type: 'text',

  size?: 'L'

}

export type PropertyDefinition = PrimitivePropertyDefinition 
  | EnumPropertyDefinition
  | ExternalAuthorityPropertyDefinition
  | TextPropertyDefinition;


