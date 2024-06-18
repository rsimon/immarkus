/**
 * Example queries:
 * 
 * Find [Images]  [where]            [Date] [is] [2020]
 * Find [Folders] [where]            [Date] [is] [2020]
 * Find [Images]  [in folders where] [Date] [is] [2020]
 * Find [Images]  [annotated with]   [Bridge]
 * Find [Images]  [annotated with]   [Bridge] where [Name] [is] [Golden Gate Bridge] 
 * 
 * Suitable types below!
 */

export interface BaseSentence {

  ConditionType: ConditionType;

}

export type ObjectType = 'FOLDER' | 'IMAGE';

export type ConditionType = 'WHERE' | 'ANNOTATED_WITH';

export interface SimpleConditionSentence extends BaseSentence {

  Attribute: string;

  Comparator: Comparator;

  Value: string;

}

export interface NestedConditionSentence extends BaseSentence {

  Value: string;

  SubConditions: SubCondition[];

}

export type Sentence = SimpleConditionSentence | NestedConditionSentence;

export type Comparator = 'IS' | 'IS_NOT_EMPTY';

export interface SubCondition {

  Attribute: string;

  Comparator: Comparator;

  Value: string;

}

export interface DropdownOption<T extends any = any> {

  label: string;

  value: string;

  data?: T;

}

export interface SchemaProperty { 

  type: ObjectType;

  propertyName: string;

}

export interface SchemaPropertyValue extends SchemaProperty {

  propertyType: string;

  value: string;

}

export interface Condition {

  sentence: Partial<Sentence>;

  matches?: string[];

  // operator: 'AND' | 'OR';

}

