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

interface Detection {

  category: string;

  label: string;

  bbox: { x_min: number, y_min: number, x_max: number, y_max: number };

}

const buildPrompt = (w: number, h: number, tags: EntityType[]) => 
`You are identifying objects in an image. Identify every instance of the following object types visible in the image:

${tags.map((t) => tagToPrompt(t)).join("\n\n")}

For each object, return a bounding box as fractions of the image width and height in XYXY order, from 0.0 to 1.0, where (0,0) is the top-left corner and (1,1) is the bottom-right corner. Boxes should tightly enclose just that object. Include every instance you can find, not just one example per category.

## Output format

Respond with ONLY a JSON object (no markdown code fences, no commentary) matching exactly this shape:

[
  {
    "category": ${tags.map(t => `"${t.id}"`).join(' | ')},
    "label": "short human-readable description",
    "bbox": { "x_min": 0, "y_min": 0, "x_max": 0, "y_max": 0 }
  }
]`;

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
      max_completion_tokens: 6500,
      ...({ reasoning: { max_tokens: 100 } } as any),
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

export const parseAnnotationResponse = (data: any, transform: PageTransform): ImageAnnotation[] => {
  const payload: Detection[] = parseOpenAIResponse(data);

  return payload.map(detection => {
    const id = uuidv4();

    const { width, height } = transform.source;

    // Normalized (0,1) on source width / height
    const { x_min, y_min, x_max, y_max } = detection.bbox;

    const { x, y, w, h } = transform({
      x: x_min * width,
      y: y_min * height,
      w: (x_max - x_min) * width,
      h: (y_max - y_min) * height
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
        source: detection.category
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
  });
}

/*
const MOCK = {
    "id": "gen-1790760770-UmpvwPPUAMV0C7Jgz4td",
    "object": "chat.completion",
    "created": 1790760770,
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
                "content": "[\n  {\"category\": \"text_label\", \"label\": \"handwritten place name top-left\", \"bbox\": {\"x_min\": 0.048, \"y_min\": 0.05, \"x_max\": 0.115, \"y_max\": 0.08}},\n  {\"category\": \"text_label\", \"label\": \"handwritten place name top-center\", \"bbox\": {\"x_min\": 0.48, \"y_min\": 0.05, \"x_max\": 0.61, \"y_max\": 0.08}},\n  {\"category\": \"text_label\", \"label\": \"circular library stamp B.R\", \"bbox\": {\"x_min\": 0.48, \"y_min\": 0.9, \"x_max\": 0.512, \"y_max\": 0.945}},\n  {\"category\": \"text_label\", \"label\": \"catalog number bottom-right\", \"bbox\": {\"x_min\": 0.828, \"y_min\": 0.965, \"x_max\": 0.94, \"y_max\": 0.99}},\n  {\"category\": \"city_gate\", \"label\": \"gate tower on top wall\", \"bbox\": {\"x_min\": 0.453, \"y_min\": 0.345, \"x_max\": 0.482, \"y_max\": 0.395}},\n  {\"category\": \"city_gate\", \"label\": \"gate tower on top-right wall\", \"bbox\": {\"x_min\": 0.545, \"y_min\": 0.38, \"x_max\": 0.578, \"y_max\": 0.435}},\n  {\"category\": \"city_gate\", \"label\": \"gate tower on upper right wall\", \"bbox\": {\"x_min\": 0.6, \"y_min\": 0.48, \"x_max\": 0.632, \"y_max\": 0.535}},\n  {\"category\": \"city_gate\", \"label\": \"gate tower on lower right wall\", \"bbox\": {\"x_min\": 0.605, \"y_min\": 0.61, \"x_max\": 0.638, \"y_max\": 0.665}},\n  {\"category\": \"city_gate\", \"label\": \"gate tower on bottom wall\", \"bbox\": {\"x_min\": 0.46, \"y_min\": 0.67, \"x_max\": 0.495, \"y_max\": 0.725}},\n  {\"category\": \"city_gate\", \"label\": \"gate tower on left wall\", \"bbox\": {\"x_min\": 0.353, \"y_min\": 0.54, \"x_max\": 0.385, \"y_max\": 0.595}},\n  {\"category\": \"house\", \"label\": \"small house inside wall (left)\", \"bbox\": {\"x_min\": 0.433, \"y_min\": 0.595, \"x_max\": 0.462, \"y_max\": 0.628}},\n  {\"category\": \"house\", \"label\": \"small house inside wall (right)\", \"bbox\": {\"x_min\": 0.515, \"y_min\": 0.61, \"x_max\": 0.542, \"y_max\": 0.642}},\n  {\"category\": \"bridge\", \"label\": \"bridge crossing river on right\", \"bbox\": {\"x_min\": 0.675, \"y_min\": 0.65, \"x_max\": 0.71, \"y_max\": 0.68}},\n  {\"category\": \"tree\", \"label\": \"tree cluster left of pagoda hill\", \"bbox\": {\"x_min\": 0.093, \"y_min\": 0.22, \"x_max\": 0.137, \"y_max\": 0.272}},\n  {\"category\": \"tree\", \"label\": \"tree cluster on pagoda hill\", \"bbox\": {\"x_min\": 0.145, \"y_min\": 0.188, \"x_max\": 0.187, \"y_max\": 0.232}},\n  {\"category\": \"tree\", \"label\": \"tree cluster mid-left\", \"bbox\": {\"x_min\": 0.202, \"y_min\": 0.272, \"x_max\": 0.272, \"y_max\": 0.365}},\n  {\"category\": \"tree\", \"label\": \"tree cluster lower-left inside bend\", \"bbox\": {\"x_min\": 0.235, \"y_min\": 0.69, \"x_max\": 0.275, \"y_max\": 0.73}},\n  {\"category\": \"tree\", \"label\": \"tree cluster lower-center\", \"bbox\": {\"x_min\": 0.315, \"y_min\": 0.695, \"x_max\": 0.362, \"y_max\": 0.74}},\n  {\"category\": \"tree\", \"label\": \"tree cluster bottom-right\", \"bbox\": {\"x_min\": 0.692, \"y_min\": 0.87, \"x_max\": 0.735, \"y_max\": 0.912}}\n]",
                "refusal": null,
                "reasoning": "The user wants me to identify objects in this historical map image. Let me carefully examine the image for each class: text_label, city_gate, house, bridge, tree.\n\nStarting with text_label: There's handwriting at top-left \"Khekiang\" (or similar), top-middle \"Ku Tcheon fou\", bottom-right \"ESTNUN 1024-11301\" or similar catalog number, and a stamp \"B.R\" at bottom middle. Let me capture these.\n\nCity_gate: The walled city has several gate towers set into the wall. Let me count them. Top wall has one gate tower around (0.47, 0.36). Another on top-right around (0.56, 0.40). Right side has one around (0.61, 0.49) and another around (0.62, 0.62). Bottom wall has one around (0.48, 0.69). Left wall has one around (0.37, 0.55). So about 6 gate towers.\n\nHouse: Inside the wall there are two small buildings/houses around (0.45, 0.61) and (0.53, 0.62).\n\nBridge: There's a bridge structure on the right where the road crosses the river around (0.69, 0.66).\n\nTree: Multiple tree clusters. Top-left near pagoda (0.11, 0.24) and (0.16, 0.21). Middle-left cluster (0.24, 0.31). Lower-middle clusters (0.25, 0.71) and (0.34, 0.71). Bottom-right cluster (0.71, 0.89). Let me list each.\n\nLet me define bounding boxes as fractions.\n\nText labels:\n- \"Khekiang\" top-left: x ~0.05-0.11, y ~0.05-0.08\n- \"Ku Tcheon fou\" top-middle: x ~0.48-0.61, y ~0.05-0.08\n- \"B.R\" stamp bottom: x ~0.48-0.51, y ~0.90-0.94\n- catalog number bottom-right: x ~0.83-0.94, y ~0.96-0.99\n\nCity gates (gate towers on wall):\n1. top: (0.455,0.345)-(0.48,0.39)\n2. top-right: (0.545,0.38)-(0.575,0.43)\n3. right-upper: (0.60,0.48)-(0.63,0.53)\n4. right-lower: (0.605,0.61)-(0.635,0.66)\n5. bottom: (0.46,0.67)-(0.495,0.72)\n6. left: (0.355,0.54)-(0.385,0.59)\n\nHouses:\n- (0.435,0.595)-(0.46,0.625)\n- (0.515,0.61)-(0.54,0.64)\n\nBridge:\n- (0.675,0.65)-(0.71,0.68)\n\nTrees:\n- (0.095,0.22)-(0.135,0.27) left of pagoda hill\n- (0.145,0.19)-(0.185,0.23) on pagoda hill\n- (0.20,0.27)-(0.27,0.36) middle-left cluster\n- (0.235,0.69)-(0.275,0.73) lower cluster\n- (0.315,0.695)-(0.36,0.74) lower cluster 2\n- (0.69,0.87)-(0.735,0.91) bottom-right cluster\n\nNow produce JSON.",
                "reasoning_details": [
                    {
                        "type": "reasoning.text",
                        "text": "The user wants me to identify objects in this historical map image. Let me carefully examine the image for each class: text_label, city_gate, house, bridge, tree.\n\nStarting with text_label: There's handwriting at top-left \"Khekiang\" (or similar), top-middle \"Ku Tcheon fou\", bottom-right \"ESTNUN 1024-11301\" or similar catalog number, and a stamp \"B.R\" at bottom middle. Let me capture these.\n\nCity_gate: The walled city has several gate towers set into the wall. Let me count them. Top wall has one gate tower around (0.47, 0.36). Another on top-right around (0.56, 0.40). Right side has one around (0.61, 0.49) and another around (0.62, 0.62). Bottom wall has one around (0.48, 0.69). Left wall has one around (0.37, 0.55). So about 6 gate towers.\n\nHouse: Inside the wall there are two small buildings/houses around (0.45, 0.61) and (0.53, 0.62).\n\nBridge: There's a bridge structure on the right where the road crosses the river around (0.69, 0.66).\n\nTree: Multiple tree clusters. Top-left near pagoda (0.11, 0.24) and (0.16, 0.21). Middle-left cluster (0.24, 0.31). Lower-middle clusters (0.25, 0.71) and (0.34, 0.71). Bottom-right cluster (0.71, 0.89). Let me list each.\n\nLet me define bounding boxes as fractions.\n\nText labels:\n- \"Khekiang\" top-left: x ~0.05-0.11, y ~0.05-0.08\n- \"Ku Tcheon fou\" top-middle: x ~0.48-0.61, y ~0.05-0.08\n- \"B.R\" stamp bottom: x ~0.48-0.51, y ~0.90-0.94\n- catalog number bottom-right: x ~0.83-0.94, y ~0.96-0.99\n\nCity gates (gate towers on wall):\n1. top: (0.455,0.345)-(0.48,0.39)\n2. top-right: (0.545,0.38)-(0.575,0.43)\n3. right-upper: (0.60,0.48)-(0.63,0.53)\n4. right-lower: (0.605,0.61)-(0.635,0.66)\n5. bottom: (0.46,0.67)-(0.495,0.72)\n6. left: (0.355,0.54)-(0.385,0.59)\n\nHouses:\n- (0.435,0.595)-(0.46,0.625)\n- (0.515,0.61)-(0.54,0.64)\n\nBridge:\n- (0.675,0.65)-(0.71,0.68)\n\nTrees:\n- (0.095,0.22)-(0.135,0.27) left of pagoda hill\n- (0.145,0.19)-(0.185,0.23) on pagoda hill\n- (0.20,0.27)-(0.27,0.36) middle-left cluster\n- (0.235,0.69)-(0.275,0.73) lower cluster\n- (0.315,0.695)-(0.36,0.74) lower cluster 2\n- (0.69,0.87)-(0.735,0.91) bottom-right cluster\n\nNow produce JSON.",
                        "format": "unknown",
                        "index": 0
                    }
                ]
            }
        }
    ],
    "usage": {
        "prompt_tokens": 2820,
        "completion_tokens": 2214,
        "total_tokens": 5034,
        "cost": 0.018924,
        "is_byok": false,
        "prompt_tokens_details": {
            "cached_tokens": 0,
            "cache_write_tokens": 0,
            "audio_tokens": 0,
            "video_tokens": 0
        },
        "cost_details": {
            "upstream_inference_cost": 0.018924,
            "upstream_inference_prompt_cost": 0.00564,
            "upstream_inference_completions_cost": 0.013284
        },
        "completion_tokens_details": {
            "reasoning_tokens": 982,
            "image_tokens": 0,
            "audio_tokens": 0
        }
    }
}
*/