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

  return `You are an expert annotator assisting with the scholarly transcription of historical sources. The attached image is a region selected from a larger document by a researcher.

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

  const promptTags = tags.map(tag => {
    const ancestors: { id: string, label?: string, selected: boolean }[] = [];
    const visited = new Set([tag.id]);
    let parentId = tag.parentId;

    while (parentId && !visited.has(parentId)) {
      visited.add(parentId);

      const parent = selectedTypesById.get(parentId);
      if (!parent) {
        ancestors.unshift({ id: parentId, selected: false });
        break;
      }

      ancestors.unshift({ id: parent.id, label: parent.label, selected: true });
      parentId = parent.parentId;
    }

    const hierarchy = [...ancestors, { id: tag.id, label: tag.label, selected: true }]
      .map(type => `${type.label || type.id} (${JSON.stringify(type.id)}; ${type.selected ? 'selected output category' : 'context only'})`)
      .join(' > ');

    return `${tagToPrompt(tag)}\nHierarchy (broadest to most specific): ${hierarchy}`;
  });

  const allowedCategories = JSON.stringify(tags.map(tag => tag.id));

  return `You are identifying objects in an image. You have two tasks:

## Task 1: Object Detection

For each object, return a bounding box as fractions of the image width and height in XYXY order, normalized to a range from 0.0 to 1.0, where (0,0) is the top-left corner and (1,1) is the bottom-right corner. Boxes should tightly enclose just that object. Include every instance you can find, not just one example per category.

## Task 2: Property extraction

For each object you identify, assign exactly one category and record information about it. Record **only** information that is grounded in the image. Do not infer information from your own knowledge or interpolate information just because it seems plausible; any information you record must be based only on what is explicitly visible in the image.

## Available entity types

Image dimensions: ${w} × ${h} pixels.

You may use only these selected category IDs: ${allowedCategories}.

${promptTags.join('\n\n')}

## Choosing the category

The hierarchy describes subtype relationships (for example, a sedan is a kind of car). It does not mean that a parent and child are separate objects or that both should be returned for the same object.

For each visible object, choose the most specific selected category that the image evidence supports. If a selected child type is uncertain but a selected ancestor is clearly supported, use that ancestor. Ancestors marked "context only" explain the hierarchy but are not valid output categories. Never guess a more specific child based only on plausibility. If no selected category is sufficiently supported, omit that object.

Use the properties listed for the chosen category. These include properties inherited from its parent types.

## Output format

Respond ONLY with a valid JSON array (no markdown code fences, no commentary). Each item must match this shape:

[
  {
    "category": "<one of the selected category IDs listed above>",
    "label": "short human-readable description",
    "bbox": { "x_min": 0.01, "y_min": 0.1, "x_max": 0.9, "y_max": 0.821 },
    "properties": {}
  }
]

Use exactly one allowed category ID per object. Include the fields defined for that category in "properties". Remember to normalize coordinates to the range [0, 1] relative to the image. Every coordinate must be a plain decimal literal (e.g. 0.043). Never write expressions, fractions, or divisions such as "43 / 1000".`;
};

