import { TextTag } from './TextTag';
import { Entity } from './Entity';
import { Relation } from './Relation';

export interface Vocabulary {

  tags: TextTag[];

  entities: Entity[];

  relations: Relation[];

}