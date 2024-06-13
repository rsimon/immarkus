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

  ObjectType: 'FOLDER' | 'IMAGE';

  ConditionType: 'WHERE' | 'IN_FOLDERS_WHERE' | 'ANNOTATED_WITH';

}

export interface SimpleConditionSentence<T> extends BaseSentence {

  Attribute: string;

  Comparator: Comparator;

  Value: T;

}

export interface NestedConditionSentence<T> extends BaseSentence {

  Value: string;

  SubConditions: SubCondition<T>[];

}

export type Sentence<T> = SimpleConditionSentence<T> | NestedConditionSentence<T>;

export type Comparator = 'IS' | 'IS_NOT_EMPTY';

export interface SubCondition <T> {

  Attribute: string;

  Comparator: Comparator;

  Value: T;

}