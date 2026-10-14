import { EntityType, PropertyDefinition } from '@/model';

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
* Include the entity instance in the list even if you can fill only a single property. It's ok to leave some properties blank. As long as you can fill at least one property, 
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
  tags: EntityType[]
): string => {
  const selectedTypesById = new Map(tags.map(type => [type.id, type]));
  
  const hierarchy = tags.flatMap(child => {
    const parent = child.parentId ? selectedTypesById.get(child.parentId) : undefined;
    return parent
      ? [`"${child.label || child.id}" is a subtype of "${parent.label || parent.id}".`]
      : [];
  });

  return `You are identifying objects in an image. You have two tasks: 
  
## Task 1: Object Detection

For each object, return a bounding box as fractions of the image width and height in XYXY order, normalized to a range from 0.0 to 1.0, where (0,0) is the top-left corner and (1,1) is the bottom-right corner. Boxes should tightly enclose just that object. Include every instance you can find, not just one example per category.

## Task 2: Property extraction

For each object you identify, assign a category, and record information about it. Record **only** information that is grounded in the image. Do not infer information from your own knowledge, or interpolate information just because it seems plausible to you - any information you record must be based **only** on whatever is shown explicitly in the image.

For the same object, choose the most specific listed class supported by the image; do not return both a parent and child class.

${tags.map(tagToPrompt).join('\n\n')}

${hierarchy.length > 0 ? `## Class hierarchy ${hierarchy.join('\n')}` : ''}

## Output format

Respond ONLY with a valid JSON array (no markdown or commentary):

[
  {
    "category": "<class ID>",
    "label": "short human-readable description",
    "bbox": { "x_min": 0.01, "y_min": 0.1, "x_max": 0.9, "y_max": 0.821 },
    "properties": {}
  }
]

Use the class ID and property fields shown above. Coordinates must be decimal numbers between 0 and 1.`;
}
