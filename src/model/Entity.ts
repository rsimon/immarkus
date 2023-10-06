export interface Entity {

  id: string;

  label: string;

  color?: string;

  description?: string;

  schema?: EntityProperty[];

}

type StringProperty = {

  name: string,

  type: 'string'

}

type NumberProperty = {

  name: string,

  type: 'number'

}

type EnumProperty = {

  name: string,

  type: 'enum',

  values: string[],

  multipleChoice?: boolean

}

export type EntityProperty = StringProperty | NumberProperty | EnumProperty;

