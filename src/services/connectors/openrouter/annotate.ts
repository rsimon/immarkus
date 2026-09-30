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
      max_completion_tokens: 16000,
      ...({ reasoning: { max_tokens: 8000 } } as any),
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

const MOCK = {
    "id": "gen-1790757548-TGOFhAvf62Qa2fWmKyUG",
    "object": "chat.completion",
    "created": 1790757548,
    "model": "google/gemini-3.1-pro-preview",
    "provider": "Google",
    "system_fingerprint": null,
    "service_tier": "default",
    "choices": [
        {
            "index": 0,
            "logprobs": null,
            "finish_reason": "stop",
            "native_finish_reason": "STOP",
            "message": {
                "role": "assistant",
                "content": "[\n  {\n    \"category\": \"text_label\",\n    \"label\": \"text 'Ku Tcheon fou'\",\n    \"bbox\": {\n      \"x_min\": 0.485,\n      \"y_min\": 0.046,\n      \"x_max\": 0.609,\n      \"y_max\": 0.088\n    }\n  },\n  {\n    \"category\": \"text_label\",\n    \"label\": \"text 'Tchekiang'\",\n    \"bbox\": {\n      \"x_min\": 0.063,\n      \"y_min\": 0.046,\n      \"x_max\": 0.113,\n      \"y_max\": 0.076\n    }\n  },\n  {\n    \"category\": \"text_label\",\n    \"label\": \"text 'ESTAM 2024-11501'\",\n    \"bbox\": {\n      \"x_min\": 0.825,\n      \"y_min\": 0.957,\n      \"x_max\": 0.963,\n      \"y_max\": 0.985\n    }\n  },\n  {\n    \"category\": \"text_label\",\n    \"label\": \"stamp text 'B.R'\",\n    \"bbox\": {\n      \"x_min\": 0.48,\n      \"y_min\": 0.898,\n      \"x_max\": 0.51,\n      \"y_max\": 0.941\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue and green hills top right\",\n    \"bbox\": {\n      \"x_min\": 0.697,\n      \"y_min\": 1.0,\n      \"x_max\": 0.975,\n      \"y_max\": 0.285\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue hill top middle\",\n    \"bbox\": {\n      \"x_min\": 0.354,\n      \"y_min\": 0.053,\n      \"x_max\": 0.493,\n      \"y_max\": 0.147\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue and green hills middle right\",\n    \"bbox\": {\n      \"x_min\": 0.771,\n      \"y_min\": 0.478,\n      \"x_max\": 0.98,\n      \"y_max\": 0.584\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue hills middle right\",\n    \"bbox\": {\n      \"x_min\": 0.732,\n      \"y_min\": 0.617,\n      \"x_max\": 0.835,\n      \"y_max\": 0.672\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"green and blue hills middle right\",\n    \"bbox\": {\n      \"x_min\": 0.902,\n      \"y_min\": 0.648,\n      \"x_max\": 0.985,\n      \"y_max\": 0.702\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"green hills middle right\",\n    \"bbox\": {\n      \"x_min\": 0.792,\n      \"y_min\": 0.691,\n      \"x_max\": 0.887,\n      \"y_max\": 0.761\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue hills bottom right\",\n    \"bbox\": {\n      \"x_min\": 0.669,\n      \"y_min\": 0.778,\n      \"x_max\": 0.963,\n      \"y_max\": 0.902\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"green hills bottom middle\",\n    \"bbox\": {\n      \"x_min\": 0.428,\n      \"y_min\": 0.87,\n      \"x_max\": 0.63,\n      \"y_max\": 0.957\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue and green hills middle left\",\n    \"bbox\": {\n      \"x_min\": 0.038,\n      \"y_min\": 0.388,\n      \"x_max\": 0.176,\n      \"y_max\": 0.487\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue and green hills middle left\",\n    \"bbox\": {\n      \"x_min\": 0.038,\n      \"y_min\": 0.518,\n      \"x_max\": 0.231,\n      \"y_max\": 0.651\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue and green hills bottom left\",\n    \"bbox\": {\n      \"x_min\": 0.046,\n      \"y_min\": 0.793,\n      \"x_max\": 0.41,\n      \"y_max\": 0.916\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"hills top left with pagoda\",\n    \"bbox\": {\n      \"x_min\": 0.134,\n      \"y_min\": 0.198,\n      \"x_max\": 0.288,\n      \"y_max\": 0.279\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue hill inside city walls\",\n    \"bbox\": {\n      \"x_min\": 0.369,\n      \"y_min\": 0.418,\n      \"x_max\": 0.46,\n      \"y_max\": 0.481\n    }\n  },\n  {\n    \"category\": \"hill\",\n    \"label\": \"blue hill inside city walls\",\n    \"bbox\": {\n      \"x_min\": 0.399,\n      \"y_min\": 0.548,\n      \"x_max\": 0.493,\n      \"y_max\": 0.611\n    }\n  },\n  {\n    \"category\": \"tree\",\n    \"label\": \"trees top left\",\n    \"bbox\": {\n      \"x_min\": 0.093,\n      \"y_min\": 0.187,\n      \"x_max\": 0.177,\n      \"y_max\": 0.273\n    }\n  },\n  {\n    \"category\": \"tree\",\n    \"label\": \"tree top left\",\n    \"bbox\": {\n      \"x_min\": 0.201,\n      \"y_min\": 0.283,\n      \"x_max\": 0.267,\n      \"y_max\": 0.365\n    }\n  },\n  {\n    \"category\": \"tree\",\n    \"label\": \"trees bottom middle\",\n    \"bbox\": {\n      \"x_min\": 0.234,\n      \"y_min\": 0.69,\n      \"x_max\": 0.274,\n      \"y_max\": 0.741\n    }\n  },\n  {\n    \"category\": \"tree\",\n    \"label\": \"trees bottom middle\",\n    \"bbox\": {\n      \"x_min\": 0.312,\n      \"y_min\": 0.696,\n      \"x_max\": 0.361,\n      \"y_max\": 0.749\n    }\n  },\n  {\n    \"category\": \"tree\",\n    \"label\": \"trees bottom right\",\n    \"bbox\": {\n      \"x_min\": 0.691,\n      \"y_min\": 0.869,\n      \"x_max\": 0.732,\n      \"y_max\": 0.913\n    }\n  },\n  {\n    \"category\": \"city_gate\",\n    \"label\": \"city gate top left\",\n    \"bbox\": {\n      \"x_min\": 0.453,\n      \"y_min\": 0.347,\n      \"x_max\": 0.477,\n      \"y_max\": 0.395\n    }\n  },\n  {\n    \"category\": \"city_gate\",\n    \"label\": \"city gate top right\",\n    \"bbox\": {\n      \"x_min\": 0.537,\n      \"y_min\": 0.38,\n      \"x_max\": 0.573,\n      \"y_max\": 0.432\n    }\n  },\n  {\n    \"category\": \"city_gate\",\n    \"label\": \"city gate middle left\",\n    \"bbox\": {\n      \"x_min\": 0.344,\n      \"y_min\": 0.536,\n      \"x_max\": 0.382,\n      \"y_max\": 0.589\n    }\n  },\n  {\n    \"category\": \"city_gate\",\n    \"label\": \"city gate bottom middle\",\n    \"bbox\": {\n      \"x_min\": 0.458,\n      \"y_min\": 0.672,\n      \"x_max\": 0.492,\n      \"y_max\": 0.728\n    }\n  },\n  {\n    \"category\": \"city_gate\",\n    \"label\": \"city gate middle right\",\n    \"bbox\": {\n      \"x_min\": 0.612,\n      \"y_min\": 0.479,\n      \"x_max\": 0.648,\n      \"y_max\": 0.535\n    }\n  },\n  {\n    \"category\": \"city_gate\",\n    \"label\": \"city gate bottom right\",\n    \"bbox\": {\n      \"x_min\": 0.608,\n      \"y_min\": 0.605,\n      \"x_max\": 0.648,\n      \"y_max\": 0.66\n    }\n  }\n]",
                "refusal": null,
                "reasoning": null,
                "reasoning_details": [
                    {
                        "type": "reasoning.text",
                        "signature": "AY89a1/zY679PHs8SmvkTtL7PlxyH16X51gqJkruf4YlUST5GVJdwUkw2zXMVyuWMVZrThb48d9fjlnUfDlIC/HsnqHWN37KSsPvrIHdIgEfYn2w8Mk4uIw=",
                        "format": "google-gemini-v1",
                        "index": 0
                    }
                ]
            }
        }
    ],
    "usage": {
        "prompt_tokens": 1364,
        "completion_tokens": 2619,
        "total_tokens": 3983,
        "cost": 0.034156,
        "is_byok": false,
        "prompt_tokens_details": {
            "cached_tokens": 0,
            "cache_write_tokens": 0,
            "audio_tokens": 0,
            "video_tokens": 0
        },
        "cost_details": {
            "upstream_inference_cost": 0.034156,
            "upstream_inference_prompt_cost": 0.002728,
            "upstream_inference_completions_cost": 0.031428
        },
        "completion_tokens_details": {
            "reasoning_tokens": 0,
            "image_tokens": 0,
            "audio_tokens": 0
        }
    }
}