import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { AnnotationServiceResponse, PageTransform } from '@/services';
import { fileToBase64, parseOpenAIResponse, tagToPrompt, urlToBase64 } from '@/services/utils';

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

export const annotate = (image: File | string, width: number, height: number, options?: Record<string, any>, tags?: EntityType[]) => {
  const apiKey = options['api-key'];
  const model = options['model'];

  // Should never happen
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
    const prompt = buildPrompt(width, height, tags);  

    return client.chat.completions.create({
      model,
      max_completion_tokens: 4000,
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

    /*
    return Promise.resolve(({
      generator,
      data: MOCK
    }));
    */
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

    const { x_min, y_min, x_max, y_max } = detection.bbox;

    const { x, y, w, h } = transform({
      x: x_min,
      y: y_min,
      w: x_max - x_min,
      h: y_max - y_min
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

const MOCK = {
    "id": "gen-1790689464-VZuPP3HdwLfahiEPArWA",
    "object": "chat.completion",
    "created": 1790689464,
    "model": "google/gemini-3.1-pro-preview",
    "provider": "Google",
    "system_fingerprint": null,
    "service_tier": "provisioned",
    "choices": [
        {
            "index": 0,
            "logprobs": null,
            "finish_reason": "length",
            "native_finish_reason": "MAX_TOKENS",
            "message": {
                "role": "assistant",
                "content": "[\n  {\n    \"category\": \"text_label\",\n    \"label\": \"Top title text\",\n    \"bbox\": {\n      \"x_min\": 0.392,\n      \"y_min\": 0.046,\n      \"x_max\": 0.573,\n      \"y_max\": 0.117\n    }\n  },\n  {\n    \"category\": \"text_label\",\n    \"label\": \"Bottom right margin text\",\n    \"bbox\": {\n      \"x_min\": 0.826,\n      \"y_min\": 0.97,\n      \"x_max\": 0.9",
                "refusal": null,
                "reasoning": "**Identifying Key Objects**\n\nMy focus has been on pinpointing bounding boxes for 'text_label', 'city_gate', 'house', and 'bridge'. I'm currently refining the identification of text elements, noting a specific inscription at the top and another fragment at the bottom right, alongside a seal.\n\n**Refining Object Boundaries**\n\nI'm now concentrating on refining the exact boundaries for the identified city gate instances. Specifically, I'm scrutinizing the details of the gate towers and arches, paying close attention to the gate at the top and the one on the right within the wall's structure.\n\n**Detailing Gate Coordinates**\n\nI'm now meticulously mapping out the precise coordinates for each identified gate. My current focus is on the gates located on the bottom-right, bottom-middle, bottom-middle-left, bottom-left, middle-left, and within the central inner structure.\n\n**Locating All Bridges**\n\nI've now identified two distinct bridge structures. I've also mapped coordinates for paths in the bottom right and an inner section of the wall, refining my current focus on precise gate delineations.\n\n**Mapping All Structures**\n\nI have now mapped out the precise coordinates for four distinct house structures and five potential bridge locations, though one is more of a stepped path. I'm also double-checking the coordinates for the identified text labels and the central inner structure.\n\n**Updating Gate Coordinates**\n\nI have meticulously cataloged the precise coordinates for nine distinct city gate entrances and one inner gate structure. My current task involves further verification of these bounding boxes, ensuring accuracy for each gate identified across the cityscape.\n\n**Verifying Bridge Boundaries**\n\nI'm currently re-evaluating the bounding box for bridge 2 on the bottom-right river, noting its current coordinates seem a bit narrow. I will visually inspect the image again to ensure the x and y ranges accurately capture the full extent of the structure.\n\n",
                "reasoning_details": [
                    {
                        "type": "reasoning.text",
                        "text": "**Identifying Key Objects**\n\nMy focus has been on pinpointing bounding boxes for 'text_label', 'city_gate', 'house', and 'bridge'. I'm currently refining the identification of text elements, noting a specific inscription at the top and another fragment at the bottom right, alongside a seal.\n\n**Refining Object Boundaries**\n\nI'm now concentrating on refining the exact boundaries for the identified city gate instances. Specifically, I'm scrutinizing the details of the gate towers and arches, paying close attention to the gate at the top and the one on the right within the wall's structure.\n\n**Detailing Gate Coordinates**\n\nI'm now meticulously mapping out the precise coordinates for each identified gate. My current focus is on the gates located on the bottom-right, bottom-middle, bottom-middle-left, bottom-left, middle-left, and within the central inner structure.\n\n**Locating All Bridges**\n\nI've now identified two distinct bridge structures. I've also mapped coordinates for paths in the bottom right and an inner section of the wall, refining my current focus on precise gate delineations.\n\n**Mapping All Structures**\n\nI have now mapped out the precise coordinates for four distinct house structures and five potential bridge locations, though one is more of a stepped path. I'm also double-checking the coordinates for the identified text labels and the central inner structure.\n\n**Updating Gate Coordinates**\n\nI have meticulously cataloged the precise coordinates for nine distinct city gate entrances and one inner gate structure. My current task involves further verification of these bounding boxes, ensuring accuracy for each gate identified across the cityscape.\n\n**Verifying Bridge Boundaries**\n\nI'm currently re-evaluating the bounding box for bridge 2 on the bottom-right river, noting its current coordinates seem a bit narrow. I will visually inspect the image again to ensure the x and y ranges accurately capture the full extent of the structure.\n\n",
                        "format": "google-gemini-v1",
                        "index": 0
                    }
                ]
            }
        }
    ],
    "usage": {
        "prompt_tokens": 1382,
        "completion_tokens": 3996,
        "total_tokens": 5378,
        "cost": 0.050716,
        "is_byok": false,
        "prompt_tokens_details": {
            "cached_tokens": 0,
            "cache_write_tokens": 0,
            "audio_tokens": 0,
            "video_tokens": 0
        },
        "cost_details": {
            "upstream_inference_cost": 0.050716,
            "upstream_inference_prompt_cost": 0.002764,
            "upstream_inference_completions_cost": 0.047952
        },
        "completion_tokens_details": {
            "reasoning_tokens": 3837,
            "image_tokens": 0,
            "audio_tokens": 0
        }
    }
}