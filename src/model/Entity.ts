export interface Entity {

  id: string;

  label: string;

  color?: string;

  description?: string;

  schema?: EntityProperty[];

}

export type StringProperty = {

  name: string,

  type: 'string'

}

export type NumberProperty = {

  name: string,

  type: 'number'

}

export type EnumProperty = {

  name: string,

  type: 'enum',

  values: string[],

  multipleChoice?: boolean

}

export type URIProperty = {

  name: string,

  type: 'uri'

}

export type CoordinateProperty = {

  name: string,

  type: 'coordinate'

}

export type EntityProperty = 
  StringProperty | 
  NumberProperty | 
  EnumProperty | 
  URIProperty |
  CoordinateProperty;

