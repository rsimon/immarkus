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

export type ConditionType = 'WHERE' | 'IN_FOLDERS_WHERE' | 'ANNOTATED_WITH';

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

export interface DropdownOption {

  label: string;

  value: string;

}

export interface SchemaProperty { 

  type: ObjectType;

  propertyName: string;

}

export interface SchemaPropertyValue extends SchemaProperty {

  value: string;

}

