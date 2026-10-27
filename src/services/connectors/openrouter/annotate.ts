import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { EntityType, RelationshipType } from '@/model';
import { AnnotationServiceResponse, PageTransform } from '@/services';
import { buildAnnotatePrompt } from '@/services/prompts';
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

interface AnnotationResponse {

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

    /*
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
    */

    return Promise.resolve(({
      generator,
      data: MOCK_RESPONSE
    }));
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
  // console.log('[openrouter.annotate] LLM response', data);

  const payload: AnnotationResponse = parseOpenAIResponse(data);

  console.log('[openrouter.annotate] LLM response payload', payload);

  const { objects, relations } = payload;

  const scale = sniffScale(objects);

  return objects.map(detection => {
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
}

const MOCK_RESPONSE = {
    "id": "gen-1793087823-kJBTOF37ZBdskb7UTmFD",
    "object": "chat.completion",
    "created": 1793087823,
    "model": "google/gemini-3.7-flash",
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
                "content": "```json\n{\n  \"objects\": [\n    {\n      \"id\": \"o0\",\n      \"category\": \"text_label\",\n      \"label\": \"text label\",\n      \"bbox\": {\n        \"x_min\": 389,\n        \"y_min\": 43,\n        \"x_max\": 579,\n        \"y_max\": 121\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o1\",\n      \"category\": \"house\",\n      \"label\": \"house\",\n      \"bbox\": {\n        \"x_min\": 440,\n        \"y_min\": 100,\n        \"x_max\": 479,\n        \"y_max\": 145\n      },\n      \"properties\": {\n        \"inside walls\": \"Outside walls\"\n      }\n    },\n    {\n      \"id\": \"o2\",\n      \"category\": \"house\",\n      \"label\": \"house\",\n      \"bbox\": {\n        \"x_min\": 523,\n        \"y_min\": 169,\n        \"x_max\": 560,\n        \"y_max\": 208\n      },\n      \"properties\": {\n        \"inside walls\": \"Outside walls\"\n      }\n    },\n    {\n      \"id\": \"o3\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 517,\n        \"y_min\": 240,\n        \"x_max\": 564,\n        \"y_max\": 315\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o4\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 740,\n        \"y_min\": 348,\n        \"x_max\": 795,\n        \"y_max\": 439\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o5\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 794,\n        \"y_min\": 481,\n        \"x_max\": 849,\n        \"y_max\": 587\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o6\",\n      \"category\": \"house\",\n      \"label\": \"house\",\n      \"bbox\": {\n        \"x_min\": 873,\n        \"y_min\": 504,\n        \"x_max\": 911,\n        \"y_max\": 544\n      },\n      \"properties\": {\n        \"inside walls\": \"Outside walls\"\n      }\n    },\n    {\n      \"id\": \"o7\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 696,\n        \"y_min\": 597,\n        \"x_max\": 761,\n        \"y_max\": 702\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o8\",\n      \"category\": \"bridge\",\n      \"label\": \"bridge\",\n      \"bbox\": {\n        \"x_min\": 753,\n        \"y_min\": 768,\n        \"x_max\": 794,\n        \"y_max\": 816\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o9\",\n      \"category\": \"house\",\n      \"label\": \"house\",\n      \"bbox\": {\n        \"x_min\": 804,\n        \"y_min\": 801,\n        \"x_max\": 850,\n        \"y_max\": 853\n      },\n      \"properties\": {\n        \"inside walls\": \"Outside walls\"\n      }\n    },\n    {\n      \"id\": \"o10\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 588,\n        \"y_min\": 670,\n        \"x_max\": 645,\n        \"y_max\": 756\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o11\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 462,\n        \"y_min\": 682,\n        \"x_max\": 511,\n        \"y_max\": 759\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o12\",\n      \"category\": \"bridge\",\n      \"label\": \"bridge\",\n      \"bbox\": {\n        \"x_min\": 601,\n        \"y_min\": 801,\n        \"x_max\": 629,\n        \"y_max\": 844\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o13\",\n      \"category\": \"bridge\",\n      \"label\": \"bridge\",\n      \"bbox\": {\n        \"x_min\": 464,\n        \"y_min\": 796,\n        \"x_max\": 489,\n        \"y_max\": 846\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o14\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 322,\n        \"y_min\": 662,\n        \"x_max\": 374,\n        \"y_max\": 757\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o15\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 232,\n        \"y_min\": 558,\n        \"x_max\": 288,\n        \"y_max\": 655\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o16\",\n      \"category\": \"human_made_structure\",\n      \"label\": \"watchtower with flag\",\n      \"bbox\": {\n        \"x_min\": 98,\n        \"y_min\": 725,\n        \"x_max\": 180,\n        \"y_max\": 912\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o17\",\n      \"category\": \"human_made_structure\",\n      \"label\": \"gate structure / tower\",\n      \"bbox\": {\n        \"x_min\": 145,\n        \"y_min\": 484,\n        \"x_max\": 188,\n        \"y_max\": 579\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o18\",\n      \"category\": \"human_made_structure\",\n      \"label\": \"pagoda / temple\",\n      \"bbox\": {\n        \"x_min\": 236,\n        \"y_min\": 281,\n        \"x_max\": 333,\n        \"y_max\": 451\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o19\",\n      \"category\": \"human_made_structure\",\n      \"label\": \"stupa / white tower\",\n      \"bbox\": {\n        \"x_min\": 188,\n        \"y_min\": 369,\n        \"x_max\": 230,\n        \"y_max\": 501\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o20\",\n      \"category\": \"human_made_structure\",\n      \"label\": \"red gate / torii-like structure\",\n      \"bbox\": {\n        \"x_min\": 192,\n        \"y_min\": 501,\n        \"x_max\": 230,\n        \"y_max\": 546\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o21\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate\",\n      \"bbox\": {\n        \"x_min\": 322,\n        \"y_min\": 293,\n        \"x_max\": 372,\n        \"y_max\": 375\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o22\",\n      \"category\": \"house\",\n      \"label\": \"house / pavilion\",\n      \"bbox\": {\n        \"x_min\": 329,\n        \"y_min\": 412,\n        \"x_max\": 369,\n        \"y_max\": 465\n      },\n      \"properties\": {\n        \"inside walls\": \"Inside walls\"\n      }\n    },\n    {\n      \"id\": \"o23\",\n      \"category\": \"house\",\n      \"label\": \"house / pavilion\",\n      \"bbox\": {\n        \"x_min\": 372,\n        \"y_min\": 412,\n        \"x_max\": 412,\n        \"y_max\": 454\n      },\n      \"properties\": {\n        \"inside walls\": \"Inside walls\"\n      }\n    },\n    {\n      \"id\": \"o24\",\n      \"category\": \"city_gate\",\n      \"label\": \"city gate inside\",\n      \"bbox\": {\n        \"x_min\": 476,\n        \"y_min\": 427,\n        \"x_max\": 532,\n        \"y_max\": 510\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o25\",\n      \"category\": \"bridge\",\n      \"label\": \"bridge\",\n      \"bbox\": {\n        \"x_min\": 580,\n        \"y_min\": 622,\n        \"x_max\": 612,\n        \"y_max\": 648\n      },\n      \"properties\": {}\n    },\n    {\n      \"id\": \"o26\",\n      \"category\": \"text_label\",\n      \"label\": \"signature label\",\n      \"bbox\": {\n        \"x_min\": 830,\n        \"y_min\": 978,\n        \"x_max\": 952,\n        \"y_max\": 993\n      },\n      \"properties\": {}\n    }\n  ],\n  \"relations\": [\n    {\n      \"type\": \"is adjacent to\",\n      \"source\": \"o22\",\n      \"target\": \"o23\"\n    },\n    {\n      \"type\": \"is adjacent to\",\n      \"source\": \"o19\",\n      \"target\": \"o18\"\n    },\n    {\n      \"type\": \"is adjacent to\",\n      \"source\": \"o19\",\n      \"target\": \"o20\"\n    }\n  ]\n}\n```",
                "refusal": null,
                "reasoning": null,
                "reasoning_details": [
                    {
                        "type": "reasoning.encrypted",
                        "data": "AY89a1/hiCSowPWO9BnGZf+xGXyJLiXSwwAvvkbNx9uXCvuEHLPHxiQLKtCNIMgJQzQsvYoZ2KgSpTQXFV3Y4JeYHToM3hw1GcOUz2VNk/O06DYcena/",
                        "format": "google-gemini-v1",
                        "index": 0
                    }
                ]
            }
        }
    ],
    "usage": {
        "prompt_tokens": 1984,
        "completion_tokens": 2819,
        "total_tokens": 4803,
        "cost": 0.01205925,
        "is_byok": false,
        "prompt_tokens_details": {
            "cached_tokens": 0,
            "cache_write_tokens": 0,
            "audio_tokens": 0,
            "video_tokens": 0
        },
        "cost_details": {
            "upstream_inference_cost": 0.01205925,
            "upstream_inference_prompt_cost": 0.001488,
            "upstream_inference_completions_cost": 0.01057125
        },
        "completion_tokens_details": {
            "reasoning_tokens": 0,
            "image_tokens": 0,
            "audio_tokens": 0
        }
    }
}