import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { AnnotationServiceResponse, PageTransform } from '@/services';
import { 
  fileToBase64, 
  parseOpenAIResponse, 
  tagToPrompt, 
  urlToBase64 
} from '@/services/utils';

/*
interface Detection {

  category: string;

  label: string;

  bbox: { x_min: number, y_min: number, x_max: number, y_max: number };

  properties: Record<string, any>;

}
*/

interface Point { x: number, y: number }

interface Detection {
 
  category: string;
 
  label: string;
 
  shape: {
    type: 'polygon' | 'polyline';
    coords: Point[];
  };
 
  properties: Record<string, any>;
 
}

/*
const buildPrompt = (w: number, h: number, tags: EntityType[]) => 
`You are identifying objects in an image. You have two tasks: 

## Task 1: Object Detection

For each object, return a bounding box as fractions of the image width and height in XYXY order, normalized to a range from 0.0 to 1.0, where (0,0) is the top-left corner and (1,1) is the bottom-right corner. Boxes should tightly enclose just that object. Include every instance you can find, not just one example per category.

2. ** Property extraction.** For each object you identify, assign a category, and record information about it. Record **only** information that is grounded in the image. Do not infer information from your own knowledge, or interpolate information just because it seems plausible to you - any information you record must be based **only** on whatever is shown explicitly in the image.

Identify every instance of the following object types visible in the image, along with the following property fields:

${tags.map((t) => tagToPrompt(t)).join("\n\n")}

## Bounding box format

## Output format

Respond ONLY with a valid JSON object (no markdown code fences, no commentary) matching exactly this shape:

[
  {
    "category": ${tags.map(t => `"${t.id}"`).join(' | ')},
    "label": "short human-readable description",
    "bbox": { "x_min": 0.01, "y_min": 0.1, "x_max": 0.9, "y_max": 0.821 },
    "properties": {
      <field name>: <value>
    }
  }
]

Remember to normalize coordinates to the the range of [0, 1] relative to the image.Every value must be a plain decimal literal (e.g. 0.043). Never write expressions, fractions, or divisions such as "43 / 1000".
`;
*/

const buildPrompt = (w: number, h: number, tags: EntityType[]) => 
`You are identifying object and line features in an image. You have two tasks:

## Task 1: Feature Detection

* For each object feature, return an exact polygon
* For each line or path feature, return an exact polyline
 
Points must be fractions of the image width and height, normalized to a range from 0.0 to 1.0, where (0,0) is the top-left corner and (1,1) is the bottom-right corner. Boxes and polygons should tightly enclose just that object. Polylines should precisely follow that line feature. 

Include every instance you can find, not just one example per category.

## Task 2: Property extraction

For each object you identify, assign a category, and record information about it. Record **only** information that is grounded in the image. Do not infer information from your own knowledge, or interpolate information just because it seems plausible to you - any information you record must be based **only** on whatever is shown explicitly in the image.

Identify every instance of the following object types visible in the image, along with the following property fields:

${tags.map((t) => tagToPrompt(t)).join("\n\n")}

## Output format

Respond ONLY with a valid JSON object (no markdown code fences, no commentary) matching exactly this shape:

[
  {
    "category": ${tags.map(t => `"${t.id}"`).join(' | ')},
    "label": "short human-readable description",
    "shape": {
      "type": "polyline" | "polygon" 
      "coords": [{ "x": 0.01, "y": 0.1}, { "x": 0.9, "y": 0.821 }, { "x": 0.01, "y": 0.7 }]
    },
    "properties": {
      <field name>: <value>
    }
  }
]

Remember to normalize coordinates to the the range of [0, 1] relative to the image. Every value must be a plain decimal literal (e.g. 0.043). Never write expressions, fractions, or divisions such as "43 / 1000".`;

/*
const sniffScale = (detections: Detection[]): number => {
  const values = detections.flatMap(d => {
    const { x_min, y_min, x_max, y_max } = d.bbox;
    return [x_min, y_min, x_max, y_max];
  }).filter(Number.isFinite);

  const max = Math.max(...values);

  return (max <= 1) ? 1 : 1000;
}
*/

const sniffScale = (detections: Detection[]): number => {
  const values = detections
    .flatMap(d => (d.shape?.coords || []).flatMap(c => [c?.x, c?.y]))
    .filter(Number.isFinite) as number[];
 
  if (values.length === 0)
    return 1;
 
  const max = Math.max(...values);
 
  return (max <= 1) ? 1 : 1000;
}

export const annotate = (image: File | string, transform: PageTransform, options?: Record<string, any>, tags?: EntityType[]) => {
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
    const prompt = buildPrompt(transform.source.width, transform.source.height, tags);  

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
    //   data: MOCK
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

/*
export const parseAnnotationResponse = (data: any, transform: PageTransform): ImageAnnotation[] => {
  // console.log('[openrouter.annotate] response', data);
  const payload: Detection[] = parseOpenAIResponse(data);

  console.log(payload);

  const scale = sniffScale(payload);

  return payload.map(detection => {
    const id = uuidv4();

    const { width, height } = transform.source;

    // Normalized (0,1) on source width / height
    const { x_min, y_min, x_max, y_max } = detection.bbox;

    const isValid = [x_min, y_min, x_max, y_max]
      .every(n => Number.isFinite(n) && n >= 0 && n <= scale)
      && x_max > x_min && y_max > y_min;

    if (!isValid) {
      console.warn(detection);
      console.warn('Skipping invalid detection');
      return;
    }

    const { x, y, w, h } = transform({
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
          geometry: {
            x, y, w, h,
            bounds: {
              minX: x,
              minY: y,
              maxX: x + w,
              maxY: y + h
            }
          }
        }
      }
    }
  }).filter(Boolean);
}
*/

// Drops consecutive duplicate points (and, for polygons, a closing point
// that repeats the first one) - VLMs produce these fairly often.
const cleanPoints = (coords: Point[], closed: boolean): Point[] => {
  const result = coords.filter((p, i) => 
    i === 0 || p.x !== coords[i - 1].x || p.y !== coords[i - 1].y);
 
  if (closed && result.length > 1) {
    const first = result[0];
    const last = result[result.length - 1];
    if (first.x === last.x && first.y === last.y)
      result.pop();
  }
 
  return result;
}

export const parseAnnotationResponse = (data: any, transform: PageTransform): ImageAnnotation[] => {
  console.log(data);
  
  const payload: Detection[] = parseOpenAIResponse(data);
 
  const scale = sniffScale(payload);
 
  const { width, height } = transform.source;
 
  // Maps a normalized point to page coordinates. Assumes `transform` is a 
  // scale + translate: a zero-size rect maps to just the transformed point.
  const toPagePoint = (p: Point): [number, number] => {
    const { x, y } = transform({ 
      x: (p.x * width) / scale, 
      y: (p.y * height) / scale, 
      w: 0, 
      h: 0 
    });
 
    return [x, y];
  }
 
  const MIN_POINTS = { polygon: 3, polyline: 2 };

  return payload.map(detection => {
    const id = uuidv4();
 
    const type = detection.shape?.type;
 
    const isKnownType = type === 'polygon' || type === 'polyline';
 
    const raw = Array.isArray(detection.shape?.coords) ? detection.shape.coords : [];
 
    const coordsOk = raw.every(c => 
      c && Number.isFinite(c.x) && Number.isFinite(c.y) &&
      c.x >= 0 && c.x <= scale && c.y >= 0 && c.y <= scale);
 
    const coords = (isKnownType && coordsOk) 
      ? cleanPoints(raw, type === 'polygon') 
      : [];
 
    if (!isKnownType || !coordsOk || coords.length < MIN_POINTS[type]) {
      console.warn(detection);
      console.warn('Skipping invalid detection');
      return;
    }
 
    const pagePoints = coords.map(toPagePoint);
 
    const xs = pagePoints.map(p => p[0]);
    const ys = pagePoints.map(p => p[1]);
 
    const bounds = {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys)
    };
 
    // A polygon/polyline with no extent is useless
    if (bounds.maxX <= bounds.minX && bounds.maxY <= bounds.minY) {
      console.warn(detection);
      console.warn('Skipping degenerate detection');
      return;
    }
 
    const selector = type === 'polygon'
      ? {
          type: ShapeType.POLYGON,
          geometry: {
            points: pagePoints,
            bounds
          }
        }
      : {
          type: ShapeType.POLYLINE,
          geometry: {
            points: pagePoints.map(point => ({ type: 'CORNER', point })),
            closed: false,
            bounds
          }
        };
 
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
        selector
      }
    } as ImageAnnotation;
  }).filter(Boolean);
}

const MOCK = {
    "id": "gen-1791805096-WLgK569dRFawVjNNZwr7",
    "object": "chat.completion",
    "created": 1791805096,
    "model": "qwen/qwen3.8-max-0902",
    "provider": "Alibaba",
    "system_fingerprint": null,
    "service_tier": null,
    "choices": [
        {
            "index": 0,
            "logprobs": null,
            "finish_reason": "stop",
            "native_finish_reason": "stop",
            "message": {
                "role": "assistant",
                "content": "[\n  {\"category\": \"text_label\", \"label\": \"Handwritten label top-left\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.045, \"y\": 0.055}, {\"x\": 0.115, \"y\": 0.055}, {\"x\": 0.115, \"y\": 0.078}, {\"x\": 0.045, \"y\": 0.078}]}, \"properties\": {}},\n  {\"category\": \"text_label\", \"label\": \"Handwritten label 'Ku Tcheou fou'\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.48, \"y\": 0.05}, {\"x\": 0.61, \"y\": 0.05}, {\"x\": 0.61, \"y\": 0.08}, {\"x\": 0.48, \"y\": 0.08}]}, \"properties\": {}},\n  {\"category\": \"text_label\", \"label\": \"Catalog number bottom-right\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.825, \"y\": 0.965}, {\"x\": 0.94, \"y\": 0.965}, {\"x\": 0.94, \"y\": 0.988}, {\"x\": 0.825, \"y\": 0.988}]}, \"properties\": {}},\n  {\"category\": \"text_label\", \"label\": \"Circular stamp 'B.R'\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.48, \"y\": 0.9}, {\"x\": 0.51, \"y\": 0.9}, {\"x\": 0.51, \"y\": 0.94}, {\"x\": 0.48, \"y\": 0.94}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Blue mountain top-center\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.35, \"y\": 0.13}, {\"x\": 0.4, \"y\": 0.07}, {\"x\": 0.43, \"y\": 0.065}, {\"x\": 0.47, \"y\": 0.11}, {\"x\": 0.49, \"y\": 0.13}, {\"x\": 0.36, \"y\": 0.13}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Hill with pagoda top-left\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.13, \"y\": 0.26}, {\"x\": 0.18, \"y\": 0.21}, {\"x\": 0.22, \"y\": 0.21}, {\"x\": 0.27, \"y\": 0.25}, {\"x\": 0.29, \"y\": 0.27}, {\"x\": 0.13, \"y\": 0.27}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Blue peak top-right\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.7, \"y\": 0.2}, {\"x\": 0.75, \"y\": 0.12}, {\"x\": 0.78, \"y\": 0.115}, {\"x\": 0.8, \"y\": 0.18}, {\"x\": 0.79, \"y\": 0.21}, {\"x\": 0.7, \"y\": 0.21}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Green-blue range top-right\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.83, \"y\": 0.21}, {\"x\": 0.87, \"y\": 0.165}, {\"x\": 0.92, \"y\": 0.17}, {\"x\": 0.96, \"y\": 0.19}, {\"x\": 0.96, \"y\": 0.21}, {\"x\": 0.83, \"y\": 0.22}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Green-blue hill right upper\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.67, \"y\": 0.28}, {\"x\": 0.7, \"y\": 0.245}, {\"x\": 0.74, \"y\": 0.24}, {\"x\": 0.78, \"y\": 0.27}, {\"x\": 0.78, \"y\": 0.3}, {\"x\": 0.67, \"y\": 0.31}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Green hill right mid-upper\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.71, \"y\": 0.43}, {\"x\": 0.76, \"y\": 0.375}, {\"x\": 0.79, \"y\": 0.375}, {\"x\": 0.83, \"y\": 0.41}, {\"x\": 0.85, \"y\": 0.42}, {\"x\": 0.71, \"y\": 0.43}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Hill cluster right middle\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.77, \"y\": 0.53}, {\"x\": 0.82, \"y\": 0.48}, {\"x\": 0.86, \"y\": 0.52}, {\"x\": 0.9, \"y\": 0.52}, {\"x\": 0.95, \"y\": 0.54}, {\"x\": 0.77, \"y\": 0.55}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Blue hill right lower-mid\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.74, \"y\": 0.65}, {\"x\": 0.78, \"y\": 0.615}, {\"x\": 0.81, \"y\": 0.62}, {\"x\": 0.82, \"y\": 0.65}, {\"x\": 0.74, \"y\": 0.65}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Green hill right lower\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.79, \"y\": 0.75}, {\"x\": 0.83, \"y\": 0.695}, {\"x\": 0.86, \"y\": 0.7}, {\"x\": 0.89, \"y\": 0.74}, {\"x\": 0.79, \"y\": 0.75}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Blue peak bottom-right\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.78, \"y\": 0.88}, {\"x\": 0.83, \"y\": 0.8}, {\"x\": 0.85, \"y\": 0.8}, {\"x\": 0.88, \"y\": 0.86}, {\"x\": 0.91, \"y\": 0.88}, {\"x\": 0.78, \"y\": 0.89}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Green hill bottom-right corner\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.89, \"y\": 0.85}, {\"x\": 0.93, \"y\": 0.8}, {\"x\": 0.96, \"y\": 0.81}, {\"x\": 0.96, \"y\": 0.85}, {\"x\": 0.89, \"y\": 0.86}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Small blue hill right edge\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.91, \"y\": 0.67}, {\"x\": 0.94, \"y\": 0.65}, {\"x\": 0.96, \"y\": 0.655}, {\"x\": 0.96, \"y\": 0.67}, {\"x\": 0.91, \"y\": 0.68}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Hills bottom-center\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.45, \"y\": 0.92}, {\"x\": 0.5, \"y\": 0.875}, {\"x\": 0.54, \"y\": 0.9}, {\"x\": 0.58, \"y\": 0.905}, {\"x\": 0.61, \"y\": 0.94}, {\"x\": 0.45, \"y\": 0.93}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Hills with pagoda bottom-left\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.12, \"y\": 0.89}, {\"x\": 0.2, \"y\": 0.845}, {\"x\": 0.26, \"y\": 0.86}, {\"x\": 0.3, \"y\": 0.87}, {\"x\": 0.36, \"y\": 0.9}, {\"x\": 0.12, \"y\": 0.9}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Hills left lower-mid\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.05, \"y\": 0.61}, {\"x\": 0.1, \"y\": 0.565}, {\"x\": 0.14, \"y\": 0.575}, {\"x\": 0.17, \"y\": 0.6}, {\"x\": 0.17, \"y\": 0.61}, {\"x\": 0.05, \"y\": 0.62}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Green hill left mid\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.14, \"y\": 0.57}, {\"x\": 0.18, \"y\": 0.525}, {\"x\": 0.21, \"y\": 0.53}, {\"x\": 0.22, \"y\": 0.56}, {\"x\": 0.14, \"y\": 0.58}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Hills left upper\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.04, \"y\": 0.44}, {\"x\": 0.08, \"y\": 0.405}, {\"x\": 0.11, \"y\": 0.42}, {\"x\": 0.15, \"y\": 0.43}, {\"x\": 0.16, \"y\": 0.45}, {\"x\": 0.04, \"y\": 0.46}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Green hill left upper edge\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.04, \"y\": 0.4}, {\"x\": 0.05, \"y\": 0.375}, {\"x\": 0.07, \"y\": 0.38}, {\"x\": 0.08, \"y\": 0.4}, {\"x\": 0.04, \"y\": 0.41}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Hill inside walls upper\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.38, \"y\": 0.45}, {\"x\": 0.41, \"y\": 0.425}, {\"x\": 0.43, \"y\": 0.43}, {\"x\": 0.45, \"y\": 0.45}, {\"x\": 0.38, \"y\": 0.46}]}, \"properties\": {}},\n  {\"category\": \"hill\", \"label\": \"Hill inside walls lower\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.4, \"y\": 0.6}, {\"x\": 0.44, \"y\": 0.555}, {\"x\": 0.47, \"y\": 0.575}, {\"x\": 0.49, \"y\": 0.59}, {\"x\": 0.4, \"y\": 0.61}]}, \"properties\": {}},\n  {\"category\": \"city_gate\", \"label\": \"North wall gate tower\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.455, \"y\": 0.345}, {\"x\": 0.475, \"y\": 0.345}, {\"x\": 0.48, \"y\": 0.39}, {\"x\": 0.455, \"y\": 0.39}]}, \"properties\": {\"Description\": \"Gate tower with a tiled roof and an arched opening set into the crenellated city wall.\"}},\n  {\"category\": \"city_gate\", \"label\": \"North-east wall gate tower\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.55, \"y\": 0.385}, {\"x\": 0.575, \"y\": 0.385}, {\"x\": 0.578, \"y\": 0.43}, {\"x\": 0.55, \"y\": 0.43}]}, \"properties\": {\"Description\": \"Gate tower with a tiled roof and an arched opening set into the crenellated city wall.\"}},\n  {\"category\": \"city_gate\", \"label\": \"East wall upper gate tower\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.605, \"y\": 0.48}, {\"x\": 0.625, \"y\": 0.49}, {\"x\": 0.62, \"y\": 0.52}, {\"x\": 0.6, \"y\": 0.51}]}, \"properties\": {\"Description\": \"Gate tower with a tiled roof and an arched opening set into the crenellated city wall.\"}},\n  {\"category\": \"city_gate\", \"label\": \"East wall lower gate tower\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.61, \"y\": 0.61}, {\"x\": 0.63, \"y\": 0.62}, {\"x\": 0.625, \"y\": 0.66}, {\"x\": 0.605, \"y\": 0.65}]}, \"properties\": {\"Description\": \"Gate tower with a tiled roof and an arched opening set into the crenellated city wall.\"}},\n  {\"category\": \"city_gate\", \"label\": \"South wall gate tower\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.465, \"y\": 0.675}, {\"x\": 0.49, \"y\": 0.675}, {\"x\": 0.49, \"y\": 0.72}, {\"x\": 0.465, \"y\": 0.72}]}, \"properties\": {\"Description\": \"Gate tower with a tiled roof and an arched opening set into the crenellated city wall.\"}},\n  {\"category\": \"city_gate\", \"label\": \"West wall gate tower\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.355, \"y\": 0.54}, {\"x\": 0.375, \"y\": 0.545}, {\"x\": 0.37, \"y\": 0.585}, {\"x\": 0.35, \"y\": 0.58}]}, \"properties\": {\"Description\": \"Gate tower with a tiled roof and an arched opening set into the crenellated city wall.\"}},\n  {\"category\": \"house\", \"label\": \"Red house with arched door inside walls\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.435, \"y\": 0.595}, {\"x\": 0.46, \"y\": 0.595}, {\"x\": 0.46, \"y\": 0.625}, {\"x\": 0.435, \"y\": 0.625}]}, \"properties\": {\"Style\": \"Chinese-style house with gabled tiled roof\", \"Location\": \"Inside walls\"}},\n  {\"category\": \"house\", \"label\": \"Small pavilion-like house inside walls\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.515, \"y\": 0.61}, {\"x\": 0.54, \"y\": 0.61}, {\"x\": 0.54, \"y\": 0.64}, {\"x\": 0.515, \"y\": 0.64}]}, \"properties\": {\"Style\": \"Chinese-style house with gabled tiled roof\", \"Location\": \"Inside walls\"}},\n  {\"category\": \"bridge\", \"label\": \"Bridge crossing river on the right\", \"shape\": {\"type\": \"polygon\", \"coords\": [{\"x\": 0.675, \"y\": 0.655}, {\"x\": 0.705, \"y\": 0.655}, {\"x\": 0.705, \"y\": 0.675}, {\"x\": 0.675, \"y\": 0.675}]}, \"properties\": {\"Cardinal Direction\": \"East\", \"Bridge Type\": \"beam bridge\", \"Crossing over\": \"river\"}}\n]",
                "refusal": null,
                "reasoning": "The user wants me to analyze a historical hand-drawn map (looks like a Chinese/Korean style map, possibly \"Ku Tcheou fou\" label) and detect objects: text_label, hill, city_gate, house, bridge. I need to produce normalized coordinates (0-1) for polygons/polylines.\n\nLet me carefully examine the image. It's roughly 2337x1754 or similar aspect. I'll estimate coordinates by visual inspection relative to width/height.\n\nLet me identify features:\n\nText labels:\n- Top left: \"KheRiang\" or similar handwritten text (~0.05-0.11 x, ~0.06 y)\n- Top center: \"Ku Tcheou fou\" (~0.48-0.61 x, ~0.06 y)\n- Bottom right: \"ESTNUM 1324-11501\" or similar catalog number (~0.83-0.94 x, ~0.97 y)\n- There's a stamp \"B.R\" near bottom center (~0.49 x, ~0.92 y) - that's a seal, maybe text_label.\n\nHills: many mountain/hill drawings scattered. Let me list them:\n- Top center blue mountain (~0.42 x, 0.1 y)\n- Top right blue peak (~0.76 x, 0.15 y)\n- Top right green/blue range (~0.88 x, 0.19 y)\n- Right upper green hill (~0.78 x, 0.4 y)\n- Right middle hills (~0.85 x, 0.52 y)\n- Right lower blue hill (~0.78 x, 0.64 y)\n- Right green hill (~0.84 x, 0.72 y)\n- Bottom right blue peak (~0.84 x, 0.84 y)\n- Bottom right green (~0.93 x, 0.83 y)\n- Bottom center hills (~0.5 x, 0.9 y)\n- Bottom left hills with pagoda (~0.2 x, 0.87 y)\n- Left middle hills (~0.1 x, 0.58 y)\n- Left upper hills (~0.08 x, 0.42 y)\n- Hill with pagoda top left (~0.2 x, 0.24 y)\n- Inside walls hills: (~0.41 x, 0.44 y), (~0.44 x, 0.58 y)\n- etc.\n\nCity gates: The walled city has gate towers. I see gates at:\n- Top wall gate (~0.47 x, 0.36 y)\n- Top-right wall gate (~0.56 x, 0.4 y)\n- Right wall upper gate (~0.61 x, 0.49 y)\n- Right wall lower gate (~0.62 x, 0.62 y)\n- Bottom wall gate (~0.48 x, 0.69 y)\n- Left wall gate (~0.37 x, 0.56 y)\n\nHouses: inside walls there are two small buildings:\n- (~0.45 x, 0.61 y) red house with arch door\n- (~0.53 x, 0.62 y) smaller house/pavilion\n\nBridge: There's a bridge crossing the river on the right (~0.69 x, 0.66 y) - a structure with vertical lines crossing the water.\n\nNow I need to provide coordinates. Let me be reasonably precise.\n\nI'll produce a JSON array. Let me write coordinates.\n\nImage dimensions assumption: width=1, height=1 normalized.\n\nLet me estimate each.\n\nText \"KheRiang\" top-left: polygon around (0.045,0.055)-(0.115,0.075). I'll give polygon.\n\nText \"Ku Tcheou fou\": (0.48,0.05)-(0.61,0.08).\n\nCatalog bottom-right: (0.825,0.965)-(0.94,0.985).\n\nStamp \"B.R\": (0.48,0.90)-(0.51,0.94).\n\nHills - I'll create polygons approximating each mountain blob.\n\nLet me list hills with rough polygons (4-6 points each).\n\n1. Top center blue mountain: center ~ (0.42,0.10). polygon: (0.35,0.13),(0.40,0.07),(0.43,0.065),(0.47,0.11),(0.49,0.13),(0.36,0.13).\n\n2. Hill with pagoda top-left: (0.13,0.26),(0.18,0.21),(0.22,0.21),(0.27,0.25),(0.29,0.27),(0.13,0.27).\n\n3. Top-right blue peak: (0.70,0.20),(0.75,0.12),(0.78,0.115),(0.80,0.18),(0.79,0.21),(0.70,0.21).\n\n4. Top-right range green/blue: (0.83,0.21),(0.87,0.165),(0.92,0.17),(0.96,0.19),(0.96,0.21),(0.83,0.22).\n\n5. Right upper-mid green+blue: (0.67,0.28),(0.70,0.245),(0.74,0.24),(0.78,0.27),(0.78,0.30),(0.67,0.31).\n\n6. Right green hill mid: (0.71,0.43),(0.76,0.375),(0.79,0.375),(0.83,0.41),(0.85,0.42),(0.71,0.43).\n\n7. Right middle hills: (0.77,0.53),(0.82,0.48),(0.86,0.52),(0.90,0.52),(0.95,0.54),(0.77,0.55).\n\n8. Right lower blue hill: (0.74,0.65),(0.78,0.615),(0.81,0.62),(0.82,0.65),(0.74,0.65).\n\n9. Right green hill lower: (0.79,0.75),(0.83,0.695),(0.86,0.70),(0.89,0.74),(0.79,0.75).\n\n10. Bottom-right blue peak: (0.78,0.88),(0.83,0.80),(0.85,0.80),(0.88,0.86),(0.91,0.88),(0.78,0.89).\n\n11. Bottom-right green: (0.89,0.85),(0.93,0.80),(0.96,0.81),(0.96,0.85),(0.89,0.86).\n\n12. Bottom center hills: (0.45,0.92),(0.50,0.875),(0.54,0.90),(0.58,0.905),(0.61,0.94),(0.45,0.93).\n\n13. Bottom-left hills with pagoda: (0.12,0.89),(0.20,0.845),(0.26,0.86),(0.30,0.87),(0.36,0.90),(0.12,0.90).\n\n14. Left lower-mid hills: (0.05,0.61),(0.10,0.565),(0.14,0.575),(0.17,0.60),(0.17,0.61),(0.05,0.62).\n\n15. Left mid green hill: (0.14,0.57),(0.18,0.525),(0.21,0.53),(0.22,0.56),(0.14,0.58).\n\n16. Left upper hills: (0.04,0.44),(0.08,0.405),(0.11,0.42),(0.15,0.43),(0.16,0.45),(0.04,0.46).\n\n17. Left upper green: (0.04,0.40),(0.05,0.375),(0.07,0.38),(0.08,0.40),(0.04,0.41).\n\n18. Inside walls hill upper: (0.38,0.45),(0.41,0.425),(0.43,0.43),(0.45,0.45),(0.38,0.46).\n\n19. Inside walls hill lower: (0.40,0.60),(0.44,0.555),(0.47,0.575),(0.49,0.59),(0.40,0.61).\n\n20. Bottom-right small blue hill near (0.94,0.66): (0.91,0.67),(0.94,0.65),(0.96,0.655),(0.96,0.67),(0.91,0.68).\n\nThat's plenty of hills.\n\nCity gates (6):\n- Top gate: polygon (0.455,0.345),(0.475,0.345),(0.48,0.39),(0.455,0.39).\n- Top-right gate: (0.55,0.385),(0.575,0.385),(0.578,0.43),(0.55,0.43).\n- Right upper gate: (0.605,0.48),(0.625,0.49),(0.62,0.52),(0.60,0.51).\n- Right lower gate: (0.61,0.61),(0.63,0.62),(0.625,0.66),(0.605,0.65).\n- Bottom gate: (0.465,0.675),(0.49,0.675),(0.49,0.72),(0.465,0.72).\n- Left gate: (0.355,0.54),(0.375,0.545),(0.37,0.585),(0.35,0.58).\n\nHouses (2):\n- House 1 (red with arch): (0.435,0.595),(0.46,0.595),(0.46,0.625),(0.435,0.625).\n- House 2 (pavilion): (0.515,0.61),(0.54,0.61),(0.54,0.64),(0.515,0.64).\n\nBridge (1): right river crossing: (0.675,0.655),(0.705,0.655),(0.705,0.675),(0.675,0.675).\n\nNow properties:\n- city_gate Description: \"Gate tower with arched opening set into the crenellated city wall\" etc.\n- house Style: maybe \"Chinese-style house with gabled roof\" / Location \"Inside walls\".\n- bridge: Cardinal Direction: the bridge crosses river oriented roughly East-West? The river runs vertically (north-south) there, bridge crosses it horizontally => oriented East-West => \"East\"? The cardinal direction the bridge is oriented: it spans east-west, so \"East\" or \"West\". I'll say \"East\". Bridge Type: \"stone beam bridge\" or just \"beam bridge\". Crossing over: \"river\".\n\nNow produce JSON. Keep coordinates plain decimals.\n\nI'll write final answer.",
                "reasoning_details": [
                    {
                        "type": "reasoning.text",
                        "text": "The user wants me to analyze a historical hand-drawn map (looks like a Chinese/Korean style map, possibly \"Ku Tcheou fou\" label) and detect objects: text_label, hill, city_gate, house, bridge. I need to produce normalized coordinates (0-1) for polygons/polylines.\n\nLet me carefully examine the image. It's roughly 2337x1754 or similar aspect. I'll estimate coordinates by visual inspection relative to width/height.\n\nLet me identify features:\n\nText labels:\n- Top left: \"KheRiang\" or similar handwritten text (~0.05-0.11 x, ~0.06 y)\n- Top center: \"Ku Tcheou fou\" (~0.48-0.61 x, ~0.06 y)\n- Bottom right: \"ESTNUM 1324-11501\" or similar catalog number (~0.83-0.94 x, ~0.97 y)\n- There's a stamp \"B.R\" near bottom center (~0.49 x, ~0.92 y) - that's a seal, maybe text_label.\n\nHills: many mountain/hill drawings scattered. Let me list them:\n- Top center blue mountain (~0.42 x, 0.1 y)\n- Top right blue peak (~0.76 x, 0.15 y)\n- Top right green/blue range (~0.88 x, 0.19 y)\n- Right upper green hill (~0.78 x, 0.4 y)\n- Right middle hills (~0.85 x, 0.52 y)\n- Right lower blue hill (~0.78 x, 0.64 y)\n- Right green hill (~0.84 x, 0.72 y)\n- Bottom right blue peak (~0.84 x, 0.84 y)\n- Bottom right green (~0.93 x, 0.83 y)\n- Bottom center hills (~0.5 x, 0.9 y)\n- Bottom left hills with pagoda (~0.2 x, 0.87 y)\n- Left middle hills (~0.1 x, 0.58 y)\n- Left upper hills (~0.08 x, 0.42 y)\n- Hill with pagoda top left (~0.2 x, 0.24 y)\n- Inside walls hills: (~0.41 x, 0.44 y), (~0.44 x, 0.58 y)\n- etc.\n\nCity gates: The walled city has gate towers. I see gates at:\n- Top wall gate (~0.47 x, 0.36 y)\n- Top-right wall gate (~0.56 x, 0.4 y)\n- Right wall upper gate (~0.61 x, 0.49 y)\n- Right wall lower gate (~0.62 x, 0.62 y)\n- Bottom wall gate (~0.48 x, 0.69 y)\n- Left wall gate (~0.37 x, 0.56 y)\n\nHouses: inside walls there are two small buildings:\n- (~0.45 x, 0.61 y) red house with arch door\n- (~0.53 x, 0.62 y) smaller house/pavilion\n\nBridge: There's a bridge crossing the river on the right (~0.69 x, 0.66 y) - a structure with vertical lines crossing the water.\n\nNow I need to provide coordinates. Let me be reasonably precise.\n\nI'll produce a JSON array. Let me write coordinates.\n\nImage dimensions assumption: width=1, height=1 normalized.\n\nLet me estimate each.\n\nText \"KheRiang\" top-left: polygon around (0.045,0.055)-(0.115,0.075). I'll give polygon.\n\nText \"Ku Tcheou fou\": (0.48,0.05)-(0.61,0.08).\n\nCatalog bottom-right: (0.825,0.965)-(0.94,0.985).\n\nStamp \"B.R\": (0.48,0.90)-(0.51,0.94).\n\nHills - I'll create polygons approximating each mountain blob.\n\nLet me list hills with rough polygons (4-6 points each).\n\n1. Top center blue mountain: center ~ (0.42,0.10). polygon: (0.35,0.13),(0.40,0.07),(0.43,0.065),(0.47,0.11),(0.49,0.13),(0.36,0.13).\n\n2. Hill with pagoda top-left: (0.13,0.26),(0.18,0.21),(0.22,0.21),(0.27,0.25),(0.29,0.27),(0.13,0.27).\n\n3. Top-right blue peak: (0.70,0.20),(0.75,0.12),(0.78,0.115),(0.80,0.18),(0.79,0.21),(0.70,0.21).\n\n4. Top-right range green/blue: (0.83,0.21),(0.87,0.165),(0.92,0.17),(0.96,0.19),(0.96,0.21),(0.83,0.22).\n\n5. Right upper-mid green+blue: (0.67,0.28),(0.70,0.245),(0.74,0.24),(0.78,0.27),(0.78,0.30),(0.67,0.31).\n\n6. Right green hill mid: (0.71,0.43),(0.76,0.375),(0.79,0.375),(0.83,0.41),(0.85,0.42),(0.71,0.43).\n\n7. Right middle hills: (0.77,0.53),(0.82,0.48),(0.86,0.52),(0.90,0.52),(0.95,0.54),(0.77,0.55).\n\n8. Right lower blue hill: (0.74,0.65),(0.78,0.615),(0.81,0.62),(0.82,0.65),(0.74,0.65).\n\n9. Right green hill lower: (0.79,0.75),(0.83,0.695),(0.86,0.70),(0.89,0.74),(0.79,0.75).\n\n10. Bottom-right blue peak: (0.78,0.88),(0.83,0.80),(0.85,0.80),(0.88,0.86),(0.91,0.88),(0.78,0.89).\n\n11. Bottom-right green: (0.89,0.85),(0.93,0.80),(0.96,0.81),(0.96,0.85),(0.89,0.86).\n\n12. Bottom center hills: (0.45,0.92),(0.50,0.875),(0.54,0.90),(0.58,0.905),(0.61,0.94),(0.45,0.93).\n\n13. Bottom-left hills with pagoda: (0.12,0.89),(0.20,0.845),(0.26,0.86),(0.30,0.87),(0.36,0.90),(0.12,0.90).\n\n14. Left lower-mid hills: (0.05,0.61),(0.10,0.565),(0.14,0.575),(0.17,0.60),(0.17,0.61),(0.05,0.62).\n\n15. Left mid green hill: (0.14,0.57),(0.18,0.525),(0.21,0.53),(0.22,0.56),(0.14,0.58).\n\n16. Left upper hills: (0.04,0.44),(0.08,0.405),(0.11,0.42),(0.15,0.43),(0.16,0.45),(0.04,0.46).\n\n17. Left upper green: (0.04,0.40),(0.05,0.375),(0.07,0.38),(0.08,0.40),(0.04,0.41).\n\n18. Inside walls hill upper: (0.38,0.45),(0.41,0.425),(0.43,0.43),(0.45,0.45),(0.38,0.46).\n\n19. Inside walls hill lower: (0.40,0.60),(0.44,0.555),(0.47,0.575),(0.49,0.59),(0.40,0.61).\n\n20. Bottom-right small blue hill near (0.94,0.66): (0.91,0.67),(0.94,0.65),(0.96,0.655),(0.96,0.67),(0.91,0.68).\n\nThat's plenty of hills.\n\nCity gates (6):\n- Top gate: polygon (0.455,0.345),(0.475,0.345),(0.48,0.39),(0.455,0.39).\n- Top-right gate: (0.55,0.385),(0.575,0.385),(0.578,0.43),(0.55,0.43).\n- Right upper gate: (0.605,0.48),(0.625,0.49),(0.62,0.52),(0.60,0.51).\n- Right lower gate: (0.61,0.61),(0.63,0.62),(0.625,0.66),(0.605,0.65).\n- Bottom gate: (0.465,0.675),(0.49,0.675),(0.49,0.72),(0.465,0.72).\n- Left gate: (0.355,0.54),(0.375,0.545),(0.37,0.585),(0.35,0.58).\n\nHouses (2):\n- House 1 (red with arch): (0.435,0.595),(0.46,0.595),(0.46,0.625),(0.435,0.625).\n- House 2 (pavilion): (0.515,0.61),(0.54,0.61),(0.54,0.64),(0.515,0.64).\n\nBridge (1): right river crossing: (0.675,0.655),(0.705,0.655),(0.705,0.675),(0.675,0.675).\n\nNow properties:\n- city_gate Description: \"Gate tower with arched opening set into the crenellated city wall\" etc.\n- house Style: maybe \"Chinese-style house with gabled roof\" / Location \"Inside walls\".\n- bridge: Cardinal Direction: the bridge crosses river oriented roughly East-West? The river runs vertically (north-south) there, bridge crosses it horizontally => oriented East-West => \"East\"? The cardinal direction the bridge is oriented: it spans east-west, so \"East\" or \"West\". I'll say \"East\". Bridge Type: \"stone beam bridge\" or just \"beam bridge\". Crossing over: \"river\".\n\nNow produce JSON. Keep coordinates plain decimals.\n\nI'll write final answer.",
                        "format": "unknown",
                        "index": 0
                    }
                ]
            }
        }
    ],
    "usage": {
        "prompt_tokens": 3430,
        "completion_tokens": 7425,
        "total_tokens": 10855,
        "cost": 0.05141,
        "is_byok": false,
        "prompt_tokens_details": {
            "cached_tokens": 0,
            "cache_write_tokens": 0,
            "audio_tokens": 0,
            "video_tokens": 0
        },
        "cost_details": {
            "upstream_inference_cost": 0.05141,
            "upstream_inference_prompt_cost": 0.00686,
            "upstream_inference_completions_cost": 0.04455
        },
        "completion_tokens_details": {
            "reasoning_tokens": 3016,
            "image_tokens": 0,
            "audio_tokens": 0
        }
    }
}
