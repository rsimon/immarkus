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

  properties: Record<string, any>;

}

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

const sniffScale = (detections: Detection[]): number => {
  const values = detections.flatMap(d => {
    const { x_min, y_min, x_max, y_max } = d.bbox;
    return [x_min, y_min, x_max, y_max];
  }).filter(Number.isFinite);

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

export const parseAnnotationResponse = (data: any, transform: PageTransform): ImageAnnotation[] => {
  // console.log('[openrouter.annotate] parsing...');

  const payload: Detection[] = parseOpenAIResponse(data);
  console.debug('LLM response', payload);

  const scale = sniffScale(payload);
  console.log({ scale });

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

/*
const MOCK = [
    {
        "category": "city_gate",
        "label": "Gate tower in the northern wall",
        "bbox": {
            "x_min": 0.51,
            "y_min": 0.24,
            "x_max": 0.56,
            "y_max": 0.32
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the north-western wall",
        "bbox": {
            "x_min": 0.33,
            "y_min": 0.29,
            "x_max": 0.37,
            "y_max": 0.37
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the eastern wall",
        "bbox": {
            "x_min": 0.74,
            "y_min": 0.35,
            "x_max": 0.79,
            "y_max": 0.43
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the south-eastern wall",
        "bbox": {
            "x_min": 0.79,
            "y_min": 0.48,
            "x_max": 0.84,
            "y_max": 0.58
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the southern wall (east)",
        "bbox": {
            "x_min": 0.7,
            "y_min": 0.6,
            "x_max": 0.75,
            "y_max": 0.7
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the southern wall (middle)",
        "bbox": {
            "x_min": 0.59,
            "y_min": 0.67,
            "x_max": 0.64,
            "y_max": 0.75
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the southern wall (west)",
        "bbox": {
            "x_min": 0.46,
            "y_min": 0.68,
            "x_max": 0.51,
            "y_max": 0.76
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the southern wall (far west)",
        "bbox": {
            "x_min": 0.32,
            "y_min": 0.66,
            "x_max": 0.37,
            "y_max": 0.75
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the south-western wall",
        "bbox": {
            "x_min": 0.23,
            "y_min": 0.56,
            "x_max": 0.28,
            "y_max": 0.65
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the western wall",
        "bbox": {
            "x_min": 0.14,
            "y_min": 0.46,
            "x_max": 0.18,
            "y_max": 0.58
        },
        "properties": {
            "Description": "A gatehouse with a grey tiled roof and a red door, set into the crenellated city wall."
        }
    },
    {
        "category": "city_gate",
        "label": "Gate tower in the central wall",
        "bbox": {
            "x_min": 0.47,
            "y_min": 0.43,
            "x_max": 0.53,
            "y_max": 0.5
        },
        "properties": {
            "Description": "A small gatehouse with a grey tiled roof and an arched opening, set into a wall segment within the city."
        }
    },
    {
        "category": "house",
        "label": "House outside the city walls (north)",
        "bbox": {
            "x_min": null,
            "y_min": 0.11,
            "x_max": 0.48,
            "y_max": 0.14
        },
        "properties": {
            "Style": "Simple rectangular building with a grey pitched roof",
            "Location": null
        }
    },
    {
        "category": "house",
        "label": "House outside the city walls (north-east)",
        "bbox": {
            "x_min": 0.52,
            "y_min": 0.17,
            "x_max": 0.56,
            "y_max": 0.2
        },
        "properties": {
            "Style": "Simple rectangular building with a grey pitched roof",
            "Location": null
        }
    },
    {
        "category": "house",
        "label": "House outside the city walls (east)",
        "bbox": {
            "x_min": 0.87,
            "y_min": 0.5,
            "x_max": 0.91,
            "y_max": 0.54
        },
        "properties": {
            "Style": "Simple rectangular building with a grey pitched roof",
            "Location": null
        }
    },
    {
        "category": "house",
        "label": "House outside the city walls (south-east)",
        "bbox": {
            "x_min": 0.8,
            "y_min": 0.8,
            "x_max": 0.85,
            "y_max": 0.85
        },
        "properties": {
            "Style": "Simple rectangular building with a grey pitched roof",
            "Location": null
        }
    },
    {
        "category": "house",
        "label": "Pavilion inside the city walls",
        "bbox": {
            "x_min": 0.33,
            "y_min": 0.41,
            "x_max": 0.37,
            "y_max": 0.45
        },
        "properties": {
            "Style": "Pavilion with a grey tiled roof and red pillars",
            "Location": "Inside walls"
        }
    },
    {
        "category": "house",
        "label": "Pavilion inside the city walls",
        "bbox": {
            "x_min": null,
            "y_min": 0.41,
            "x_max": 0.41,
            "y_max": 0.45
        },
        "properties": {
            "Style": "Pavilion with a grey tiled roof and red pillars",
            "Location": "Inside walls"
        }
    },
    {
        "category": "bridge",
        "label": "Bridge over the southern river",
        "bbox": {
            "x_min": 0.46,
            "y_min": 0.79,
            "x_max": 0.49,
            "y_max": 0.85
        },
        "properties": {
            "Cardinal Direction": "North",
            "Bridge Type": "Trestle bridge",
            "Crossing over": "River"
        }
    },
    {
        "category": "bridge",
        "label": "Bridge over the southern river",
        "bbox": {
            "x_min": 0.6,
            "y_min": 0.79,
            "x_max": 0.63,
            "y_max": 0.85
        },
        "properties": {
            "Cardinal Direction": "North",
            "Bridge Type": "Trestle bridge",
            "Crossing over": "River"
        }
    },
    {
        "category": "bridge",
        "label": "Bridge over the eastern river",
        "bbox": {
            "x_min": 0.75,
            "y_min": 0.77,
            "x_max": 0.79,
            "y_max": 0.82
        },
        "properties": {
            "Cardinal Direction": "North-West",
            "Bridge Type": "Trestle bridge",
            "Crossing over": "River"
        }
    },
    {
        "category": "text_label",
        "label": "Handwritten title text",
        "bbox": {
            "x_min": 0.38,
            "y_min": 0.04,
            "x_max": 0.58,
            "y_max": 0.12
        },
        "properties": {}
    },
    {
        "category": "text_label",
        "label": "Seal with letters B.R",
        "bbox": {
            "x_min": 0.49,
            "y_min": 0.88,
            "x_max": 0.52,
            "y_max": 0.92
        },
        "properties": {}
    },
    {
        "category": "text_label",
        "label": "Catalog number text",
        "bbox": {
            "x_min": 0.82,
            "y_min": 0.97,
            "x_max": 0.95,
            "y_max": 0.99
        },
        "properties": {}
    }
]
*/
