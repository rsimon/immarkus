import { ComboboxOption } from '@/components/Combobox';

export interface Graph {

  getLinkedNodes(nodeId: string): GraphNode[];

  getLinks(nodeId: string): GraphLink[];

  links: GraphLink[];

  maxDegree: number;

  maxLinkWeight: number;

  minDegree: number;

  minLinkWeight: number;

  nodes: GraphNode[];

}

export interface GraphNode {

  id: string;

  label: string;

  type: 'FOLDER' | 'IMAGE' | 'ENTITY_TYPE';

  degree: number;

  properties?: {

    [key: string]: string;
    
  }
  
}

export interface GraphLink {

  source: string;

  target: string;

  weight: number;

  primitives: GraphLinkPrimitive[];

}

export interface GraphLinkPrimitive {

  source: string;
  
  target: string;

  type: GraphLinkPrimitiveType;

  value?: string;

  data?: any;

}

export type GraphLinkPrimitiveType = 
  // Folder to Folder 
  'FOLDER_CONTAINS_SUBFOLDER' |
  // Folder to Image
  'FOLDER_CONTAINS_IMAGE' |
  // Entity Type to Entity Type via model hierarchy
  'IS_PARENT_TYPE_OF' |
  // Image to Entity Type
  'HAS_ENTITY_ANNOTATION' |
  // Image to Image via Annotation Relationship
  'HAS_RELATED_ANNOTATION_IN' |
  // Entity Type to Entity Type
  'IS_RELATED_VIA_ANNOTATION';

export interface KnowledgeGraphSettings {

  graphMode: 'HIERARCHY' | 'RELATIONS';

  hideIsolatedNodes?: boolean;

  hideAllLabels?: boolean;

  hideNodeTypeLabels?: ('FOLDER' | 'IMAGE' | 'ENTITY_TYPE')[];

  includeFolders?: boolean;

  legendExpanded?: boolean;

}

/**
 * Search query types.
 * 
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

export type ConditionType = 'WHERE' | 'WITH_ENTITY' | 'WITH_NOTE' | 'WITH_RELATIONSHIP';

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


