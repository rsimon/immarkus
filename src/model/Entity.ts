export interface Entity {

  id: string;

  label: string;

  color?: string;

  description?: string;

  schema?: EntityProperty[];

}

type BaseEntityProperty = {

  name: string, 

  required?: boolean

}

export type EnumProperty = BaseEntityProperty & {

  type: 'enum',

  values: string[],

  multipleChoice?: boolean

}

export type GeoCoordinateProperty = BaseEntityProperty & {

  type: 'geocoordinate'

}

export type NumberProperty = BaseEntityProperty & {

  type: 'number'

}

export type TextProperty = BaseEntityProperty & {

  type: 'text'

}

export type URIProperty = BaseEntityProperty & {

  type: 'uri'

}

export type EntityProperty = 
  EnumProperty |
  GeoCoordinateProperty |
  NumberProperty | 
  TextProperty  | 
  URIProperty;


