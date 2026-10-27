import { EntityType, PropertyDefinition, RelationshipType } from '@/model';

export const PROMPT_TRANSCRIBE = 
`Extract all text from this image. Your response must be ONLY valid JSON in this format: 

{ "text": "all extracted text goes here" } 
 
Preserve whitespace and newline formatting in the text output.`;

const propertyToPrompt = (property: PropertyDefinition): string | undefined => {
  const instructions = property.description ? ` — ${property.description}` : '';

  switch (property.type) {
    case 'text':
      return property.multiple
        ? `* "${property.name}": array of strings, [] if none${instructions}`
        : `* "${property.name}": string, or null if the text does not state it${instructions}`;

    case 'number':
      return `* "${property.name}": number, or null if the text does not state it${instructions}`;

    case 'enum': {
      const options = property.values.map(value => `"${value}"`).join(', ');
      return property.multiple
        ? `* "${property.name}": array containing any of [${options}], [] if none apply. Use the listed values exactly; never invent a new one${instructions}`
        : `* "${property.name}": exactly one of [${options}], or null. Use the listed values exactly; never invent a new one${instructions}`;
    }

    default:
      return undefined;
  }
}

export const tagToPrompt = (tag: EntityType): string => {
  const lines = (tag.properties || []).map(propertyToPrompt);

  return [
    `### Class: "${tag.id}"`,
    tag.label && tag.label !== tag.id ? `Also known as: ${tag.label}` : undefined,
    tag.description,
    lines.length > 0 ? `Fields to fill:\n${lines.join('\n')}` : `This class has no extractable fields; still report its mentions.`,
  ].filter(Boolean).join('\n');
}

const relationToPrompt = (relation: RelationshipType): string => {
  const cls = (id?: string) => (id ? `"${id}"` : 'any class');

  const direction = relation.directed
    ? 'Directed: the relation reads source → target.'
    : 'Undirected: source/target order carries no meaning. Report each pair once, never in both directions.';

  return [
    `### Relationship: "${relation.name}"`,
    relation.description,
    `Source class: ${cls(relation.sourceTypeId)}. Target class: ${cls(relation.targetTypeId)}.`,
    direction,
  ].filter(Boolean).join('\n');
};

export const buildTranscribeAndTagPrompt = (tags: EntityType[], instructions?: string): string => {
  if (tags.length === 0) return PROMPT_TRANSCRIBE;

  const classIds = tags.map((t) => `"${t.id}"`);

  return `The attached image is a region selected from a larger document by a researcher.

## Task 1: Transcription

Transcribe all text visible in the image.
${instructions ? `\n${instructions}\n` : ""}
* Reproduce the original characters exactly. Do not modernize, translate, or add punctuation that is not in the source.
* Preserve line breaks as they appear.
* Use ○ for characters you cannot read. Never substitute a guess.

## Task 2: Entity extraction

From your transcription, list every individual entity that belongs to one of the classes below.

${tags.map((t) => tagToPrompt(t)).join("\n\n")}

## Rules

* List each individual entity as one list item in 'entities' array. Do not merge the properties of different entity instances into the same list item. 
* List each individual entity **instance** exactly once. That means: create different list items for different entity instances (e.g. different persons), but don't create multiple list items for mulitple **mentions** of the same instance.
* Include the entity instance in the list even if you can fill only a single property. It's ok to leave some properties blank.
* If the image contains no legible text, return an empty "text" and an empty "entities" array.

## Output format

Respond with a single JSON object and nothing else — no markdown fences, no commentary:

{
  "text": "<the full transcription from Task 1>",
  "entities": [
    {
      "class": "${classIds[0]}",
      "properties": {
        <field name>: <value, as specified per class above>
      }
    },{
      "class": "${classIds[0]}",
      "properties": {
        <field name>: <value, as specified per class above>
      }
    }${classIds.length > 1 ? `, {
      "class": "${classIds[1]}",
      "properties": {
        <field name>: <value, as specified per class above>
      }
    }` : ''}
  ]
}`;
}

export const buildAnnotatePrompt = (
  w: number,
  h: number,
  tags: EntityType[],
  relations: RelationshipType[]
): string => {
  const selectedTypesById = new Map(tags.map(type => [type.id, type]));
  
  const hierarchy = tags.flatMap(child => {
    const parent = child.parentId ? selectedTypesById.get(child.parentId) : undefined;
    return parent
      ? [`"${child.label || child.id}" is a subtype of "${parent.label || parent.id}".`]
      : [];
  });

  // Basic sanitization: remove relations that point to classes not included in `tags`
  const entityTypeIds = new Set(tags.map(t => t.id));
  const applicableRelations = relations.filter(r =>
    (!r.sourceTypeId || entityTypeIds.has(r.sourceTypeId)) &&
    (!r.targetTypeId || entityTypeIds.has(r.targetTypeId))
  );
  const hasRelations = applicableRelations.length > 0;

  const relationTask = hasRelations ? `
## Task 3: Relationship extraction

After identifying all objects, list the relationships between them. A relationship connects two **object instances** you identified above, referenced by their "id".

${applicableRelations.map(relationToPrompt).join('\n\n')}

Relationship rules:

* "source" and "target" must be "id" values of objects in your list. Never reference an id that does not exist, and never invent an object just to serve as a relationship endpoint.
* The source object must belong to the relationship's source class and the target object to its target class. A subtype satisfies a constraint on its parent class.
* Report each relationship exactly once. The same pair of objects may be connected by several relationships of different types; list each separately.
* If no relationships are visible, return an empty "relations" array.
` : '';

  return `You are identifying objects in an image. You have ${hasRelations ? 'three' : 'two'} tasks: 
  
## Task 1: Object Detection

For each object, return a bounding box as fractions of the image width and height in XYXY order, normalized to a range from 0.0 to 1.0, where (0,0) is the top-left corner and (1,1) is the bottom-right corner. Boxes should tightly enclose just that object. Include every instance you can find, not just one example per category.

Give every object a unique "id" ("o1", "o2", "o3", …).

## Task 2: Property extraction

For each object you identify, assign a category, and record information about it. Record **only** information that is grounded in the image. Do not infer information from your own knowledge, or interpolate information just because it seems plausible to you - any information you record must be based **only** on what is shown explicitly in the image.

For the same object, choose the most specific listed class supported by the image; do not return both a parent and child class.

${tags.map(tagToPrompt).join('\n\n')}

${hierarchy.length > 0 ? `## Class hierarchy\n\n${hierarchy.join('\n')}` : ''}

${relationTask}

## Output format

Respond ONLY with a valid JSON array (no markdown or commentary):

{ 
  "objects": [
    {
      "id": "o1",
      "category": "<class ID>",
      "label": "short human-readable description",
      "bbox": { "x_min": 0.01, "y_min": 0.1, "x_max": 0.9, "y_max": 0.821 },
      "properties": {}
    }
  ]${hasRelations ? `,
  "relations": [
    {
      "type": "<relationship name>",
      "source": "o1", 
      "target": "o2"
    }
  ]`: ''}
}

Use the class ID and property fields shown above. Coordinates must be decimal numbers between 0 and 1.${hasRelations ? ' Use the relationship names exactly as listed.' : ''}`;
}
