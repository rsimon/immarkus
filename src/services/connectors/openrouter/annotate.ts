import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AnnotationBody, createBody, ImageAnnotation, ShapeType } from '@annotorious/react';
import { EntityType } from '@/model';
import { PageTransform } from '@/services';
import { fileToBase64, parseOpenAIResponse, tagToPrompt, urlToBase64 } from '@/services/utils';

interface Detection {

  category: string;

  label: string;

  bbox: { x_min: number, y_min: number, x_max: number, y_max: number };

}

const buildPrompt = (w: number, h: number, tags: EntityType[]) => 
`You are identifying objects in an image. The image is exactly ${w} pixels wide and ${h} pixels tall. Identify every instance of the following object types visible in the image:

${tags.map((t) => tagToPrompt(t)).join("\n\n")}

For each object, return a bounding box as absolute pixel coordinates in XYXY order: x_min and x_max between 0 and ${w}, y_min and y_max between 0 and ${h}, where (0,0) is the top-left corner of the image and (${w},${h}) is the bottom-right corner. Boxes should tightly enclose just that object. Include every instance you can find, not just one example per category.

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
    /*
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
    */

    return Promise.resolve(({
      generator,
      data: MOCK
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
    "id": "gen-1790685207-54ma2JfPGivpS8yGDclD",
    "object": "chat.completion",
    "created": 1790685207,
    "model": "qwen/qwen3.8-27b",
    "provider": "Mancer 2",
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
                "content": "\n\n[\n  {\"category\": \"text_label\", \"label\": \"Handwritten caption 'You Tham fou Capitale de Hou-quang'\", \"bbox\": {\"x_min\": 955, \"y_min\": 95, \"x_max\": 1285, \"y_max\": 255}},\n  {\"category\": \"text_label\", \"label\": \"Bottom-right catalog number text\", \"bbox\": {\"x_min\": 2305, \"y_min\": 2175, \"x_max\": 2665, \"y_max\": 2210}},\n  {\"category\": \"text_label\", \"label\": \"Circular monogram 'B.R.'\", \"bbox\": {\"x_min\": 1270, \"y_min\": 1955, \"x_max\": 1345, \"y_max\": 2045}},\n  {\"category\": \"hill\", \"label\": \"Large green landmass top right\", \"bbox\": {\"x_min\": 1650, \"y_min\": 80, \"x_max\": 2310, \"y_max\": 450}},\n  {\"category\": \"hill\", \"label\": \"Blue mountain peak upper middle\", \"bbox\": {\"x_min\": 1150, \"y_min\": 580, \"x_max\": 1410, \"y_max\": 720}},\n  {\"category\": \"hill\", \"label\": \"Blue mountain peak upper right\", \"bbox\": {\"x_min\": 1680, \"y_min\": 580, \"x_max\": 1910, \"y_max\": 720}},\n  {\"category\": \"hill\", \"label\": \"Blue mountain far right\", \"bbox\": {\"x_min\": 2270, \"y_min\": 630, \"x_max\": 2660, \"y_max\": 830}},\n  {\"category\": \"hill\", \"label\": \"Small green hills right\", \"bbox\": {\"x_min\": 1850, \"y_min\": 820, \"x_max\": 2110, \"y_max\": 930}},\n  {\"category\": \"hill\", \"label\": \"Green hills at right edge\", \"bbox\": {\"x_min\": 2390, \"y_min\": 920, \"x_max\": 2660, \"y_max\": 1030}},\n  {\"category\": \"hill\", \"label\": \"Green hills middle\", \"bbox\": {\"x_min\": 1080, \"y_min\": 930, \"x_max\": 1310, \"y_max\": 1090}},\n  {\"category\": \"hill\", \"label\": \"Blue hills middle\", \"bbox\": {\"x_min\": 1450, \"y_min\": 970, \"x_max\": 1710, \"y_max\": 1110}},\n  {\"category\": \"hill\", \"label\": \"Green hills middle right\", \"bbox\": {\"x_min\": 1750, \"y_min\": 1030, \"x_max\": 2010, \"y_max\": 1140}},\n  {\"category\": \"hill\", \"label\": \"Small blue-green hills left\", \"bbox\": {\"x_min\": 290, \"y_min\": 1220, \"x_max\": 510, \"y_max\": 1490}},\n  {\"category\": \"hill\", \"label\": \"Green landmass bottom right\", \"bbox\": {\"x_min\": 2100, \"y_min\": 1470, \"x_max\": 2660, \"y_max\": 1820}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower on wall top\", \"bbox\": {\"x_min\": 1180, \"y_min\": 530, \"x_max\": 1380, \"y_max\": 700}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower upper left\", \"bbox\": {\"x_min\": 1080, \"y_min\": 650, \"x_max\": 1260, \"y_max\": 820}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower upper right\", \"bbox\": {\"x_min\": 2100, \"y_min\": 770, \"x_max\": 2290, \"y_max\": 970}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower middle\", \"bbox\": {\"x_min\": 1580, \"y_min\": 950, \"x_max\": 1790, \"y_max\": 1130}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower right\", \"bbox\": {\"x_min\": 2230, \"y_min\": 1080, \"x_max\": 2410, \"y_max\": 1300}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower lower left\", \"bbox\": {\"x_min\": 1080, \"y_min\": 1250, \"x_max\": 1260, \"y_max\": 1450}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower lower right\", \"bbox\": {\"x_min\": 1900, \"y_min\": 1330, \"x_max\": 2110, \"y_max\": 1550}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower bottom right\", \"bbox\": {\"x_min\": 1700, \"y_min\": 1480, \"x_max\": 1910, \"y_max\": 1670}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower bottom middle\", \"bbox\": {\"x_min\": 1520, \"y_min\": 1510, \"x_max\": 1710, \"y_max\": 1690}},\n  {\"category\": \"city_gate\", \"label\": \"Gate tower bottom left\", \"bbox\": {\"x_min\": 1300, \"y_min\": 1460, \"x_max\": 1490, \"y_max\": 1670}},\n  {\"category\": \"city_gate\", \"label\": \"Red wall gate structure left\", \"bbox\": {\"x_min\": 400, \"y_min\": 1050, \"x_max\": 520, \"y_max\": 1290}},\n  {\"category\": \"house\", \"label\": \"Small house top\", \"bbox\": {\"x_min\": 1200, \"y_min\": 230, \"x_max\": 1310, \"y_max\": 310}},\n  {\"category\": \"house\", \"label\": \"Small house upper middle\", \"bbox\": {\"x_min\": 1520, \"y_min\": 380, \"x_max\": 1630, \"y_max\": 450}},\n  {\"category\": \"house\", \"label\": \"Small house right\", \"bbox\": {\"x_min\": 2400, \"y_min\": 1120, \"x_max\": 2530, \"y_max\": 1210}},\n  {\"category\": \"house\", \"label\": \"Small house bottom right\", \"bbox\": {\"x_min\": 2250, \"y_min\": 1780, \"x_max\": 2380, \"y_max\": 1880}},\n  {\"category\": \"bridge\", \"label\": \"Small bridge over river left\", \"bbox\": {\"x_min\": 1560, \"y_min\": 1760, \"x_max\": 1630, \"y_max\": 1870}},\n  {\"category\": \"bridge\", \"label\": \"Small bridge over river right\", \"bbox\": {\"x_min\": 1920, \"y_min\": 1780, \"x_max\": 1990, \"y_max\": 1870}}\n]",
                "refusal": null,
                "reasoning": "The user wants me to identify objects in a historical map image. Let me carefully examine the image and identify each category: text_label, hill, city_gate, house, bridge.\n\nThe image is 2828 x 2211 pixels.\n\nLet me look at the text labels first. There's handwritten text at the top: \"You Tham fou / Capitale de / Hou-quang\". That's around x=960-1280, y=100-250. There's also text at the bottom right: \"BSTUN 2084-11503\" around x=2300-2650, y=2180-2210. There's also a small \"B.R.\" in a circle at the bottom center around x=1280-1330, y=1980-2030.\n\nNow hills/mountains. There are many blue/green rounded landforms. Let me list them:\n- Top right green area (large blob) ~ x=1650-2300, y=80-450\n- Blue mountain peak around x=1150-1400, y=580-720\n- Blue mountain around x=1680-1900, y=580-720\n- Right blue mountain x=2280-2650, y=630-820\n- Small green hills x=1850-2100, y=820-920\n- Green hills right edge x=2400-2650, y=920-1020\n- Blue/green hills middle x=1080-1300, y=930-1080\n- Blue hills x=1450-1700, y=970-1100\n- Green hills x=1750-2000, y=1030-1130\n- Left small blue/green hills x=300-500, y=1220-1480\n- Green blob bottom right x=2100-2650, y=1470-1820\n\nCity gates: The gate towers set into the wall. Let me identify them. There are many gate towers along the wall.\n- Top gate x=1180-1380, y=530-700\n- Gate x=1080-1250, y=650-820\n- Gate right x=2100-2280, y=770-970\n- Middle gate x=1580-1780, y=950-1130\n- Right gate x=2230-2400, y=1080-1300\n- Gate lower left x=1080-1250, y=1250-1450\n- Gate x=1900-2100, y=1330-1550\n- Gate bottom middle x=1700-1900, y=1480-1670\n- Gate bottom x=1520-1700, y=1510-1690\n- Gate x=1300-1480, y=1460-1670\n- Left wall structure (red building) x=400-520, y=1050-1290\n\nHouses: small individual houses.\n- Top house x=1200-1300, y=230-310\n- House x=1520-1620, y=380-450\n- House right x=2400-2520, y=1120-1210\n- House bottom right x=2250-2370, y=1780-1880\n- Pagoda building (the multi-story tower) x=620-850, y=620-990 - this might be a house? It's a pagoda/pavilion. Hmm. Could be considered a building. The class is \"house\" small individual houses. The pagoda is more of a monument. I'll include the small houses.\n\nBridges: structures crossing water. There are two small bridges over the river at the bottom: x=1560-1620, y=1760-1870 and x=1920-1980, y=1780-1870. Also the wall crosses? The wall has gates but those are gates. The bridges over the green river: yes two small wooden-looking bridges.\n\nLet me also consider the watchtower with ladder on left (x=390-510, y=1620-2010) - that's a tower, not in categories.\n\nLet me now produce coordinates carefully.\n\nText labels:\n1. Top text \"You Tham fou Capitale de Hou-quang\": x_min ~960, y_min ~100, x_max ~1280, y_max ~250\n2. Bottom right \"BSTUN 2084-11503\": x_min ~2310, y_min ~2180, x_max ~2660, y_max ~2210\n3. Circle \"B.R.\": x_min ~1275, y_min ~1960, x_max ~1340, y_max ~2040\n\nHills: I'll list each distinct landform.\n- Top-right green landmass: 1650,80,2310,450\n- Blue peak mid-top: 1150,580,1410,720\n- Blue peak top-right: 1680,580,1910,720\n- Right blue mountain: 2270,630,2660,830\n- Right green hills small: 1850,820,2110,930\n- Right edge green: 2390,920,2660,1030\n- Middle green hills: 1080,930,1310,1090\n- Middle blue hills: 1450,970,1710,1110\n- Middle-right green hills: 1750,1030,2010,1140\n- Left blue/green small hills: 290,1220,510,1490\n- Bottom-right green: 2100,1470,2660,1820\n\nCity gates:\n- 1180,530,1380,700\n- 1080,650,1260,820\n- 2100,770,2290,970\n- 1580,950,1790,1130\n- 2230,1080,2410,1300\n- 1080,1250,1260,1450\n- 1900,1330,2110,1550\n- 1700,1480,1910,1670\n- 1520,1510,1710,1690\n- 1300,1460,1490,1670\n- Left red wall gate: 400,1050,520,1290 (this is a wall section with gate? It looks like a building on the wall). I'll include as city_gate.\n\nHouses:\n- 1200,230,1310,310\n- 1520,380,1630,450\n- 2400,1120,2530,1210\n- 2250,1780,2380,1880\n- Pagoda? I'll skip pagoda as it's a monument, but maybe include as house? The class says small individual houses. The pagoda is large. I'll leave it out. Actually the pavilion structures near the pagoda (red roofs) could be houses. There are small pavilions at x=920-1130, y=910-1020. Hmm those are like gate pavilions. I'll skip.\n\nBridges:\n- 1560,1760,1630,1870\n- 1920,1780,1990,1870\n\nLet me finalize.\n",
                "reasoning_details": [
                    {
                        "type": "reasoning.text",
                        "text": "The user wants me to identify objects in a historical map image. Let me carefully examine the image and identify each category: text_label, hill, city_gate, house, bridge.\n\nThe image is 2828 x 2211 pixels.\n\nLet me look at the text labels first. There's handwritten text at the top: \"You Tham fou / Capitale de / Hou-quang\". That's around x=960-1280, y=100-250. There's also text at the bottom right: \"BSTUN 2084-11503\" around x=2300-2650, y=2180-2210. There's also a small \"B.R.\" in a circle at the bottom center around x=1280-1330, y=1980-2030.\n\nNow hills/mountains. There are many blue/green rounded landforms. Let me list them:\n- Top right green area (large blob) ~ x=1650-2300, y=80-450\n- Blue mountain peak around x=1150-1400, y=580-720\n- Blue mountain around x=1680-1900, y=580-720\n- Right blue mountain x=2280-2650, y=630-820\n- Small green hills x=1850-2100, y=820-920\n- Green hills right edge x=2400-2650, y=920-1020\n- Blue/green hills middle x=1080-1300, y=930-1080\n- Blue hills x=1450-1700, y=970-1100\n- Green hills x=1750-2000, y=1030-1130\n- Left small blue/green hills x=300-500, y=1220-1480\n- Green blob bottom right x=2100-2650, y=1470-1820\n\nCity gates: The gate towers set into the wall. Let me identify them. There are many gate towers along the wall.\n- Top gate x=1180-1380, y=530-700\n- Gate x=1080-1250, y=650-820\n- Gate right x=2100-2280, y=770-970\n- Middle gate x=1580-1780, y=950-1130\n- Right gate x=2230-2400, y=1080-1300\n- Gate lower left x=1080-1250, y=1250-1450\n- Gate x=1900-2100, y=1330-1550\n- Gate bottom middle x=1700-1900, y=1480-1670\n- Gate bottom x=1520-1700, y=1510-1690\n- Gate x=1300-1480, y=1460-1670\n- Left wall structure (red building) x=400-520, y=1050-1290\n\nHouses: small individual houses.\n- Top house x=1200-1300, y=230-310\n- House x=1520-1620, y=380-450\n- House right x=2400-2520, y=1120-1210\n- House bottom right x=2250-2370, y=1780-1880\n- Pagoda building (the multi-story tower) x=620-850, y=620-990 - this might be a house? It's a pagoda/pavilion. Hmm. Could be considered a building. The class is \"house\" small individual houses. The pagoda is more of a monument. I'll include the small houses.\n\nBridges: structures crossing water. There are two small bridges over the river at the bottom: x=1560-1620, y=1760-1870 and x=1920-1980, y=1780-1870. Also the wall crosses? The wall has gates but those are gates. The bridges over the green river: yes two small wooden-looking bridges.\n\nLet me also consider the watchtower with ladder on left (x=390-510, y=1620-2010) - that's a tower, not in categories.\n\nLet me now produce coordinates carefully.\n\nText labels:\n1. Top text \"You Tham fou Capitale de Hou-quang\": x_min ~960, y_min ~100, x_max ~1280, y_max ~250\n2. Bottom right \"BSTUN 2084-11503\": x_min ~2310, y_min ~2180, x_max ~2660, y_max ~2210\n3. Circle \"B.R.\": x_min ~1275, y_min ~1960, x_max ~1340, y_max ~2040\n\nHills: I'll list each distinct landform.\n- Top-right green landmass: 1650,80,2310,450\n- Blue peak mid-top: 1150,580,1410,720\n- Blue peak top-right: 1680,580,1910,720\n- Right blue mountain: 2270,630,2660,830\n- Right green hills small: 1850,820,2110,930\n- Right edge green: 2390,920,2660,1030\n- Middle green hills: 1080,930,1310,1090\n- Middle blue hills: 1450,970,1710,1110\n- Middle-right green hills: 1750,1030,2010,1140\n- Left blue/green small hills: 290,1220,510,1490\n- Bottom-right green: 2100,1470,2660,1820\n\nCity gates:\n- 1180,530,1380,700\n- 1080,650,1260,820\n- 2100,770,2290,970\n- 1580,950,1790,1130\n- 2230,1080,2410,1300\n- 1080,1250,1260,1450\n- 1900,1330,2110,1550\n- 1700,1480,1910,1670\n- 1520,1510,1710,1690\n- 1300,1460,1490,1670\n- Left red wall gate: 400,1050,520,1290 (this is a wall section with gate? It looks like a building on the wall). I'll include as city_gate.\n\nHouses:\n- 1200,230,1310,310\n- 1520,380,1630,450\n- 2400,1120,2530,1210\n- 2250,1780,2380,1880\n- Pagoda? I'll skip pagoda as it's a monument, but maybe include as house? The class says small individual houses. The pagoda is large. I'll leave it out. Actually the pavilion structures near the pagoda (red roofs) could be houses. There are small pavilions at x=920-1130, y=910-1020. Hmm those are like gate pavilions. I'll skip.\n\nBridges:\n- 1560,1760,1630,1870\n- 1920,1780,1990,1870\n\nLet me finalize.\n",
                        "format": "unknown",
                        "index": 0
                    }
                ]
            }
        }
    ],
    "usage": {
        "prompt_tokens": 6497,
        "completion_tokens": 3990,
        "total_tokens": 10487,
        "cost": 0.0112725,
        "is_byok": false,
        "prompt_tokens_details": {
            "cached_tokens": 0,
            "cache_write_tokens": 0,
            "audio_tokens": 0,
            "video_tokens": 0
        },
        "cost_details": {
            "upstream_inference_cost": 0.0112725,
            "upstream_inference_prompt_cost": 0.0012991810207195061,
            "upstream_inference_completions_cost": 0.009973318979280494
        },
        "completion_tokens_details": {
            "reasoning_tokens": 1080,
            "image_tokens": 0,
            "audio_tokens": 0
        }
    }
}