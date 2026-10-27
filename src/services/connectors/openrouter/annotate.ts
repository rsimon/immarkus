import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ShapeType } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import { EntityType, RelationshipType } from '@/model';
import { buildAnnotatePrompt } from '@/services/prompts';
import { DataModel } from '@/store';
import { 
  AnnotationServiceCrosswalkResponse, 
  AnnotationServiceResponse, 
  PageTransform, 
  Region 
} from '@/services';
import {
  fileToBase64,
  parseOpenAIResponse,
  transformRectangle,
  urlToBase64
} from '@/services/utils';

interface DetectedObject {

  id: string;

  category: string;

  label: string;

  bbox: { x_min: number, y_min: number, x_max: number, y_max: number };

  properties: Record<string, any>;

}

interface DetectedRelation {

  type: string;

  source: string;

  target: string;

}

interface DetectionResponse {

  objects: DetectedObject[];

  relations?: DetectedRelation[];

}

const sniffScale = (detections: DetectedObject[]): number => {
  const values = detections.flatMap(d => {
    const { x_min, y_min, x_max, y_max } = d.bbox;
    return [x_min, y_min, x_max, y_max];
  }).filter(Number.isFinite);

  const max = Math.max(...values);
  return (max <= 1) ? 1 : 1000;
}

export const annotate = (
  image: File | string,
  transform: PageTransform,
  options?: Record<string, any>,
  tags: EntityType[] = [],
  relations: RelationshipType[] = []
) => {
  const apiKey = options['api-key'];
  const model = options['model'];

  if (!apiKey)
    throw new Error('Missing API key');

  const generator = {
    id: model,
    name: `OpenRouter (${model})`,
    homepage: 'https://openrouter.ai/'
  };

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true
  });

  const submit = (imageUrl: string) => {
    const prompt = buildAnnotatePrompt(transform.source.width, transform.source.height, tags, relations);

    return client.chat.completions.create({
      model,
      max_completion_tokens: 12000,
      ...({ reasoning: { max_tokens: 1000 } } as any),
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: prompt
        },{
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        }]
      }]
    }).then((data: any) => ({ generator, data } as AnnotationServiceResponse));

    // return Promise.resolve(({
    //   generator,
    //   data: MOCK_RESPONSE
    // }));
  }

  if (typeof image === 'string') {
    return urlToBase64(image).then(base64 =>
      submit(`data:image/jpeg;base64,${base64}`));
  } else {
    return fileToBase64(image as File).then(base64 =>
      submit(`data:image/jpeg;base64,${base64}`));
  }
}

export const parseAnnotationResponse = (
  data: any,
  transform: PageTransform,
  _: Region | undefined,
  __: Record<string, any> = {},
  model: DataModel
): AnnotationServiceCrosswalkResponse => {
  // console.log('[openrouter.annotate] LLM response', data);

  const payload: DetectionResponse = parseOpenAIResponse(data);

  // console.log('[openrouter.annotate] LLM response payload', payload);

  const objects = payload.objects ?? [];
  const detectedRrelations = payload.relations ?? [];

  const scale = sniffScale(objects);
  const { width, height } = transform.source;

  // LLM id -> { uuid, category }
  const idMap = new Map<string, { uuid: string, category: string }>();

  const annotations = objects.map(detection => {
    // Normalized (0,1) on source width / height
    const { x_min, y_min, x_max, y_max } = detection.bbox;

    const isValid = [x_min, y_min, x_max, y_max]
      .every(n => Number.isFinite(n) && n >= 0 && n <= scale)
      && x_max > x_min && y_max > y_min;

    if (!isValid) {
      console.warn('Skipping invalid detection', detection);
      return;
    }

    const id = uuidv4();

    if (detection.id) {
      if (idMap.has(detection.id)) {
        console.warn(`LLM created duplicate object ID: ${detection.id}`);
      } else {
        idMap.set(detection.id, { uuid: id, category: detection.category });
      }
    }

    const geometry = transformRectangle(transform, {
      x: (x_min * width) / scale,
      y: (y_min * height) / scale,
      w: (x_max - x_min) * width / scale,
      h: (y_max - y_min) * height / scale
    });

    return {
      id,
      bodies: [{
        annotation: id,
        purpose: 'commenting',
        value: detection.label
      }, {
        annotation: id,
        purpose: 'classifying',
        type: 'Dataset',
        source: detection.category,
        properties: detection.properties
      }] as AnnotationBody[],
      target: {
        annotation: id,
        selector: {
          type: ShapeType.RECTANGLE,
          geometry
        }
      }
    }
  }).filter(Boolean);

  const relations = parseRelations(
    detectedRrelations,
    idMap,
    model.entityTypes,
    model.relationshipTypes);

  return { annotations, relations };
}

const parseRelations = (
  detected: DetectedRelation[],
  idMap: Map<string, { uuid: string, category: string }>,
  tags: EntityType[], // For future use: verify source/target 
  relationTypes: RelationshipType[]
): [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][] => {
  if (detected.length === 0) return [];

  // Lookup maps
  // const typesById = new Map(tags.map(t => [t.id, t]));
  const schemaByName = new Map(relationTypes.map(r => [r.name, r]));

  /* True if `categoryId` is `requiredId` or a descendant of it
  const satisfies = (categoryId: string, requiredId?: string): boolean => {
    if (!requiredId) return true;

    const seen = new Set<string>();
    let current: string | undefined = categoryId;

    while (current && !seen.has(current)) {
      if (current === requiredId) return true;
      seen.add(current);
      current = typesById.get(current)?.parentId;
    }

    return false;
  };
  */

  const seenKeys = new Set<string>();
  const result: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][] = [];

  for (const rel of detected) {
    const schema = schemaByName.get(rel.type);

    if (!schema) {
      console.warn('Skipping unknown relation', rel);
      continue;
    }

    const source = idMap.get(rel.source);
    const target = idMap.get(rel.target);
    if (!source || !target) {
      console.warn('Skipping invalid relation', rel);
      continue;
    }

    if (source.uuid === target.uuid) {
      console.warn('Skipping self-relation', rel);
      continue;
    }

    // TODO we should check relation constraints here!
    // if (!satisfies(source.category, schema.sourceTypeId) ||
    //     !satisfies(target.category, schema.targetTypeId)) {
    //   console.warn('Skipping relation violating class constraints', rel);
    //   continue;
    // }

    // Dedupe (for undirected relations [a,b] and [b,a] are the same relation)
    const pair = schema.directed
      ? [source.uuid, target.uuid]
      : [source.uuid, target.uuid].sort();

    const key = `${schema.name}|${pair.join('|')}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const linkId = uuidv4();
    const created = new Date().toISOString();

    const link = {
      id: linkId,
      motivation: 'linking',
      body: source.uuid,
      target: target.uuid,
      created
    } as W3CRelationLinkAnnotation;

    const meta = {
      id: uuidv4(),
      motivation: 'tagging',
      body: { value: schema.name },
      target: linkId,
      created
    } as W3CRelationMetaAnnotation;

    result.push([link, meta]);
  }

  return result;
}