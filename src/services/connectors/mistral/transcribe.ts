import { Mistral } from '@mistralai/mistralai';
import { fileToBase64, getTranscriptionPrompt, urlToBase64 } from '@/services/utils';
import { AnnotationServiceResponse, PageTransform, ServiceRequestArgs } from '@/services/Types';
import { EntityType, PropertyDefinition } from '@/model';

export const getPrompt = (options?: Record<string, any>, tags: EntityType[] = []): string | undefined =>
  options?.model?.includes('ocr') ? undefined : getTranscriptionPrompt(tags);

const compact = <T extends object>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

const propertyToOCRSchema = (property: PropertyDefinition): Record<string, unknown> | undefined => {
  const description = property.description;

  switch (property.type) {
    case 'text':
      return compact(property.multiple
        ? { type: 'array', items: { type: 'string' }, description }
        : { type: ['string', 'null'], description });

    case 'number':
      return compact({ type: ['number', 'null'], description });

    case 'enum':
      return compact(property.multiple
        ? { type: 'array', items: { type: 'string', enum: property.values }, description }
        : { type: ['string', 'null'], enum: [...property.values, null], description });

    default:
      return undefined;
  }
}

const mentionOCRSchema = {
  type: 'object',
  properties: {
    quote: {
      type: 'string',
      description: 'Verbatim quote of the mention, exactly as printed. Do not normalize or correct spelling or punctuation.'
    },
    context: {
      type: 'string',
      description: 'Verbatim text around the quote, including the quote itself, plus 2-3 words before and after.'
    }
  },
  required: ['quote', 'context'],
  additionalProperties: false
}

const entityTypeToOCRSchema = (tag: EntityType) => {
  const props = Object.fromEntries(
    (tag.properties || [])
      .map(p => [p.name, propertyToOCRSchema(p)] as const)
      .filter(([, schema]) => schema !== undefined)
  );

  return {
    type: 'object',
    description: [tag.label && tag.label !== tag.id ? `${tag.label}.` : undefined, tag.description]
      .filter(Boolean).join(' ') || undefined,
    properties: {
      class: { const: tag.id },
      properties: {
        type: 'object',
        properties: props,
        required: Object.keys(props),
        additionalProperties: false
      },
      mentions: {
        type: 'array',
        description: 'Every mention of this one entity instance in the text.',
        items: mentionOCRSchema
      }
    },
    required: ['class', 'properties', 'mentions'],
    additionalProperties: false
  };
}

const buildOCRSchema = (tags: EntityType[]) => ({
  type: 'object',
  properties: {
    entities: {
      type: 'array',
      items: tags.length === 1
        ? entityTypeToOCRSchema(tags[0])
        : { anyOf: tags.map(entityTypeToOCRSchema) }
    }
  },
  required: ['entities'],
  additionalProperties: false
});

const buildOCRPrompt = (tags: EntityType[]): string => {
  const classes = tags.map(tag => [
    `### Class: "${tag.id}"`,
    tag.label && tag.label !== tag.id ? `Also known as: ${tag.label}` : undefined,
    tag.description
  ].filter(Boolean).join('\n')).join('\n\n');

  return `The document is a region selected from a larger document by a researcher.
Extract every individual entity that belongs to one of the classes below.
Return each entity under the key matching its class id.

${classes}

## Rules

* List each individual entity as one list item. Do not merge different entity instances into the same item.
* List each entity INSTANCE exactly once. Create different items for different instances (e.g. different persons), but not multiple items for multiple MENTIONS of the same instance.
* Record each mention of an instance in its "mentions" list. Quotes and context must be verbatim: do not modernize, translate, correct or add punctuation. Retain line breaks.
* Include an entity even if you cannot fill a property; use null (or [] for lists).
* If the document contains no legible text, return an empty array for every class.`;
};

export const transcribe = (image: File | string, _t: PageTransform, args: ServiceRequestArgs = {}) => {
  const { options = {}, tags = [], customPrompt } = args;
  const apiKey = options['api-key'];
  const model = options['model'] as string;

  // Should never happen
  if (!apiKey || !model)
    throw new Error('Missing access configuration');

  const generator = {
    id: model,
    name: `Mistral (${model})`,
    homepage: 'https://docs.mistral.ai/api'
  };

  const client = new Mistral({ apiKey });

  const submit = (imageUrl: string) => {
    if (model.includes('ocr')) {
      return client.ocr.process({
        model,
        document: {
          type: 'image_url',
          imageUrl
        },
        includeBlocks: true,
        documentAnnotationFormat: {
          type: 'json_schema',
          jsonSchema: {
            name: 'entities',
            schemaDefinition: buildOCRSchema(tags),
            strict: true
          }
        },
        documentAnnotationPrompt: buildOCRPrompt(tags),
        confidenceScoresGranularity: 'word'
      }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));
     
      
      return Promise.resolve({ generator, data: MOCK_OCR_RESPONSE } as AnnotationServiceResponse);
    } else {
      const prompt = customPrompt ?? getPrompt(options, tags);
      if (!prompt)
        throw new Error('Missing transcription prompt');

      return client.chat.complete({
        model,
        maxTokens: 4000,
        messages: [
          {
            role: 'user',
            content: [{
              type: 'text',
              text: prompt
            },{
              type: 'image_url',
              imageUrl
            }]
          },
        ],
      }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));
    }
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>  
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 => 
      submit(`data:image/jpeg;base64,${base64}`));
  }
}

const MOCK_OCR_RESPONSE = {
  "pages": [
    {
      "index": 0,
      "markdown": "淵聯三\n\n卷十一\n\n四\n\n王繫之不逮省久矣以爲文王病也吾是以嘆貧笭者\n\n曰文王焉病伏羲氏病甚者也昔者伏羲氏未晝卦也\n\n三才其不立乎四序其不行乎百物其不生乎萬象其\n\n不森乎何勞乎而費晝也自伏羲氏洩道之密淄神之\n\n機分張太和磔裂元氣使天下智詭之道迸出曰我善\n\n言篆而識物情陰陽相摩遠近相取作爲剛柔同異之\n\n說以駭人志於是智者不知而大樸散矣則伏羲氏始\n\n兆亂者也安得羸嘆而嗟文王乎負其笭而行追而問\n\n之居與姓名不答而去文中子聞之曰隱者也",
      "images": [],
      "tables": [],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 1546,
        "width": 1151
      },
      "blocks": [
        {
          "topLeftX": 1053,
          "topLeftY": 59,
          "bottomRightX": 1128,
          "bottomRightY": 285,
          "content": "淵聯三",
          "confidenceScores": null,
          "type": "header"
        },
        {
          "topLeftX": 1038,
          "topLeftY": 345,
          "bottomRightX": 1129,
          "bottomRightY": 588,
          "content": "卷十一",
          "confidenceScores": null,
          "type": "header"
        },
        {
          "topLeftX": 1068,
          "topLeftY": 1153,
          "bottomRightX": 1128,
          "bottomRightY": 1202,
          "content": "四",
          "confidenceScores": null,
          "type": "header"
        },
        {
          "topLeftX": 942,
          "topLeftY": 67,
          "bottomRightX": 1022,
          "bottomRightY": 1486,
          "content": "王繫之不逮省久矣以爲文王病也吾是以嘆貧笭者",
          "confidenceScores": null,
          "type": "text"
        },
        {
          "topLeftX": 838,
          "topLeftY": 67,
          "bottomRightX": 915,
          "bottomRightY": 1481,
          "content": "曰文王焉病伏羲氏病甚者也昔者伏羲氏未晝卦也",
          "confidenceScores": null,
          "type": "text"
        },
        {
          "topLeftX": 728,
          "topLeftY": 67,
          "bottomRightX": 808,
          "bottomRightY": 1481,
          "content": "三才其不立乎四序其不行乎百物其不生乎萬象其",
          "confidenceScores": null,
          "type": "text"
        },
        {
          "topLeftX": 621,
          "topLeftY": 67,
          "bottomRightX": 699,
          "bottomRightY": 1481,
          "content": "不森乎何勞乎而費晝也自伏羲氏洩道之密淄神之",
          "confidenceScores": null,
          "type": "text"
        },
        {
          "topLeftX": 513,
          "topLeftY": 59,
          "bottomRightX": 592,
          "bottomRightY": 1481,
          "content": "機分張太和磔裂元氣使天下智詭之道迸出曰我善",
          "confidenceScores": null,
          "type": "text"
        },
        {
          "topLeftX": 402,
          "topLeftY": 59,
          "bottomRightX": 484,
          "bottomRightY": 1478,
          "content": "言篆而識物情陰陽相摩遠近相取作爲剛柔同異之",
          "confidenceScores": null,
          "type": "text"
        },
        {
          "topLeftX": 300,
          "topLeftY": 59,
          "bottomRightX": 377,
          "bottomRightY": 1478,
          "content": "說以駭人志於是智者不知而大樸散矣則伏羲氏始",
          "confidenceScores": null,
          "type": "text"
        },
        {
          "topLeftX": 190,
          "topLeftY": 59,
          "bottomRightX": 268,
          "bottomRightY": 1478,
          "content": "兆亂者也安得羸嘆而嗟文王乎負其笭而行追而問",
          "confidenceScores": null,
          "type": "text"
        },
        {
          "topLeftX": 78,
          "topLeftY": 53,
          "bottomRightX": 158,
          "bottomRightY": 1278,
          "content": "之居與姓名不答而去文中子聞之曰隱者也",
          "confidenceScores": null,
          "type": "text"
        }
      ]
    }
  ],
  "model": "mistral-ocr-4-1",
  "documentAnnotation": "{\"entities\": [{\"class\": \"person\", \"properties\": {\"Translated\": \"Fuxi\"}, \"mentions\": [{\"quote\": \"伏羲氏\", \"context\": \"吾是以嘆貧笭者曰文王焉病伏羲氏病甚者也昔者\"}, {\"quote\": \"伏羲氏\", \"context\": \"伏羲氏未晝卦也三才其不立乎\"}, {\"quote\": \"伏羲氏\", \"context\": \"何勞乎而費晝也自伏羲氏洩道之密淄神之機\"}, {\"quote\": \"伏羲氏\", \"context\": \"大樸散矣則伏羲氏始兆亂者也安得羸嘆\"}]}, {\"class\": \"person\", \"properties\": {\"Translated\": \"King Wen\"}, \"mentions\": [{\"quote\": \"文王\", \"context\": \"王繫之不逮省久矣以爲文王病也吾是以嘆貧笭者\"}, {\"quote\": \"文王\", \"context\": \"曰文王焉病伏羲氏病甚者也\"}, {\"quote\": \"文王\", \"context\": \"兆亂者也安得羸嘆而嗟文王乎負其笭\"}]}, {\"class\": \"person\", \"properties\": {\"Translated\": \"Wenzhongzi\"}, \"mentions\": [{\"quote\": \"文中子\", \"context\": \"不答而去文中子聞之曰隱者也\"}]}]}",
  "usageInfo": {
    "pagesProcessed": 1,
    "docSizeBytes": 378434
  }
}