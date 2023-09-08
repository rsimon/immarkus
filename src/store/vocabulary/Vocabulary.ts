export interface Vocabulary {

  tags: Tag[];

  entities: Entity[];

  relations: Relation[];

  addTag(tag: Tag): void;

  removeTag(tag: Tag): void;

  addEntity(entity: Entity): void;

  removeEntity(entityOrId: Entity | string): void;

  addRelation(relation: Relation): void;

  removeRelation(relationOrId: Relation | string): void;

}

// TODO just a hack for now
export type Tag = string; 

export interface Entity {

  color: string;

  name: string;

  id: string;

  notes: string;

}

export interface Relation {

  color: string;

  name: string;

  id: string;

  notes: string;

}

export const loadVocabulary = (json: Object): Vocabulary => {

  let tags: Tag[] = [];

  let entities: Entity[] = [];

  let relations: Relation[] = [];

  const addTag = (tag: Tag) => {
    if (!tags.includes(tag))
      tags = [...tags, tag];
    else 
      throw new Error('Tag already exists');
  }

  const removeTag = (tag: Tag) => {
    tags = tags.filter(t => t !== tag);
  }

  const addEntity = (entity: Entity) => {
    if (!entities.find(e => e.id === entity.id)) {
      entities = [...entities, entity];
    }
  }

  const removeEntity = (entityOrId: Entity | string) => {
    const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
    entities = entities.filter(e => e.id !== id);
  }

  const addRelation = (relation: Relation) => {
    if (!relations.find(r => r.id === relation.id)) {
      relations = [...relations, relation];
    }
  }

  const removeRelation = (relationOrId: Relation | string) => {
    const id = typeof relationOrId === 'string' ? relationOrId : relationOrId.id;
    entities = entities.filter(e => e.id !== id);
  }

  return {
    get tags() { return [...tags] },
    get entities() { return [...entities] },
    get relations() { return [...relations] },
    addTag,
    removeTag,
    addEntity,
    removeEntity,
    addRelation,
    removeRelation
  }

}