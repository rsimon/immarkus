import { Tag } from './Tag';
import { Entity } from './Entity';
import { Relation } from './Relation';

export interface Vocabulary {

  tags: Tag[];

  entities: Entity[];

  relations: Relation[];

}