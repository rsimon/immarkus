import { GraphNode } from '../Types';

export interface QueryConditionOption {

  value: string;
  
  label: string;
  
  data?: any;

}

export type Predicate = 'IS' | 'IS_NOT_EMPTY';

export type ConditionQuery = (n: GraphNode) => boolean;