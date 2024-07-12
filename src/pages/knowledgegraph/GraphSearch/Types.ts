import { ComboboxOption } from '@/components/Combobox';

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

export type ConditionType = 'WHERE' | 'WITH_ENTITY' | 'WITH_NOTE';

export interface SimpleConditionSentence extends BaseSentence {

  Attribute: DropdownOption;

  Comparator: Comparator;

  Value: DropdownOption;

}

export interface NestedConditionSentence extends BaseSentence {

  Value: DropdownOption;

  SubConditions: SubCondition[];

}

export type Sentence = SimpleConditionSentence | NestedConditionSentence;

export type Comparator = 'IS' | 'IS_NOT_EMPTY';

export interface SubCondition {

  Attribute: DropdownOption;

  Comparator: Comparator;

  Value: DropdownOption;

}

export interface DropdownOption extends ComboboxOption {

  builtIn?: boolean;

  label: string;

  value: string;

}

export interface SchemaProperty { 

  builtIn?: boolean;

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

