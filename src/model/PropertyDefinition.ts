type BasePropertyDefinition = {

  name: string, 

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

export type PropertyDefinition = PrimitivePropertyDefinition | EnumPropertyDefinition;


