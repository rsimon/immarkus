import { v4 as uuidv4 } from 'uuid';
import { type AnnotationBody, ShapeType } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import { DataModelStore } from '@/store';
import { sniffScale, transformRectangle } from './geometry';
import { parseOpenAIResponse } from './shared';
import type { 
  AnnotationServiceCrosswalkResponse, 
  AutoAnnotateResponse, 
  DetectedRelation, 
  PageTransform, 
  Region 
} from '../Types';

export const parseAnnotationResponse = (
  data: any,
  transform: PageTransform,
  _: Region | undefined,
  __: Record<string, any> = {},
  model: DataModelStore
): AnnotationServiceCrosswalkResponse => {
  // console.log('[openrouter.annotate] LLM response', data);

  const payload: AutoAnnotateResponse = parseOpenAIResponse(data);

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
        id: uuidv4(),
        annotation: id,
        purpose: 'commenting',
        value: detection.label
      }, {
        id: uuidv4(),
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
    model);

  return { annotations, relations };
}

const parseRelations = (
  detected: DetectedRelation[],
  idMap: Map<string, { uuid: string, category: string }>,
  model: DataModelStore
): [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][] => {
  if (detected.length === 0) return [];

  // Lookup maps
  // const typesById = new Map(tags.map(t => [t.id, t]));
  const schemaByName = new Map(model.relationshipTypes.map(r => [r.name, r]));

  const satisfies = (entityTypeId: string, requiredTypeId?: string) => {
    if (!requiredTypeId) return true; // No restriction

    if (entityTypeId === requiredTypeId) return true; // Matching type

    const ancestors = model.getAncestors(requiredTypeId);
    return ancestors.some(e => e.id === entityTypeId);
  }

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

    if (!satisfies(source.category, schema.sourceTypeId) ||
        !satisfies(target.category, schema.targetTypeId)) {
      console.warn('Skipping relation violating class constraints', rel);
      continue;
    }

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
      body: {
        id: uuidv4(),
        value: schema.name 
      },
      target: linkId,
      created
    } as W3CRelationMetaAnnotation;

    result.push([link, meta]);
  }

  return result;
}