import { v4 as uuidv4 } from 'uuid';
import { PageTransform, Region } from '@/services/Types';
import { ImageAnnotation, Polygon, ShapeType } from '@annotorious/react';
import type { AnnotationBody } from '@annotorious/react';
import { boundsFromPoints } from '@annotorious/annotorious';

const toAnnotation = (
  text: string, 
  vertices: { x: number, y: number }[],
  transform: PageTransform
): ImageAnnotation => {
  const id = uuidv4();

  /**
   * There's an ugly catch with the vertices contained in Google Vision responses: x and/or y 
   * might be missing! See this–deeply buried in the docs (and actually from the face 
   * recognition docs):
   * 
   * "Note that one or more x and/or y coordinates may not be generated in the BoundingPoly 
   * (the polygon will be unbounded) if only a partial face appears in the image to be annotated."
   * 
   * Cf. https://stackoverflow.com/questions/39378862/incomplete-coordinate-values-for-google-vision-ocr
   * 
   * In our case, we set the coordinate to 0 if missing, since this seems the most reasonable thing to do.
   */
  const points: [number, number][] = 
    vertices.map(({ x, y }) => transform({ x: x || 0, y: y || 0})).map(({ x, y }) => ([x, y]));

  const bounds = boundsFromPoints(points);

  return {
    id,
    bodies: [{
      annotation: id,
      purpose: 'commenting',
      value: text
    } as AnnotationBody],
    target: {
      annotation: id,
      selector: {
        type: ShapeType.POLYGON,
        geometry: {
          bounds,
          points
        }
      } as Polygon
    }
  }
}

interface WordPos {

  word: string;

  start: number;

  end: number;

}

const clipFullText = (words: string[], fullText: string, startSearchIndex = 0) => {
  if (words.length === 0) return { text: '', index: startSearchIndex };
  
  let searchIndex = startSearchIndex;

  let wordPositions: WordPos[] = [];
  
  // Go through the reference fulltext and find each word
  for (const word of words) {
    const start = fullText.indexOf(word, searchIndex);
    if (start === -1) break;
  
    const end = start + word.length;
    wordPositions.push({ word, start, end });
    searchIndex = end;
  }
  
  if (wordPositions.length === 0)
    return { text: '', index: startSearchIndex };
  
  // Here's the trick: we can't be sure about interpunctuation between words.
  // The clean text will be the range between the start of the first word and 
  // the end of the last word
  const pStart = wordPositions[0].start;
  const pEnd = wordPositions[wordPositions.length - 1].end;
  
  return {
    text: fullText.substring(pStart, pEnd),
    index: pEnd
  };
}

const mergeAnnotations = (
  response: any,
  transform: PageTransform,
  granularity: 'block' | 'paragraph'
) => {
  const { fullTextAnnotation } = response;

  if (!fullTextAnnotation)
    throw new Error('Unexpected response: fullTextAnnotation missing');

  const { pages, text: fullText } = fullTextAnnotation;
  if (!pages)
    throw new Error('Unexpected response: pages missing in fullTextAnnotation');

  if (!fullText)
    throw new Error('Unexpected response: text missing in fullTextAnnotation');

  if (!Array.isArray(pages) || pages.length !== 1)
    throw new Error('Unexpected response: invalid pages');

  const { blocks } = pages[0];
  if (!blocks)
    throw new Error('Unexpected response: blocks missing in fullTextAnnotation page');

  if (!Array.isArray(blocks))
    throw new Error('Unexpected response: invalid blocks');

  const merged = blocks
    .filter(b => b.blockType === 'TEXT')
    .reduce<{ words: string[], boundingBox: [number, number][] }[]>((all, block) => {
      if (granularity === 'block') {
        const { boundingBox } = block;
        const words: string[] = block.paragraphs
          .flatMap((p: any) => p.words)
          .map((w: any) => w.symbols.map((s: any) => s.text).join(''));
        
        return [...all, { boundingBox, words }]
      } else {
        const paragraphs = block.paragraphs.map(p => {
          const { boundingBox } = p;
          const words = p.words.map((w: any) => w.symbols.map((s: any) => s.text).join(''));
          return { boundingBox, words };
        });

        return [...all, ...paragraphs];
      }
    }, []);

  // Note that the 'words' lose whitespace information! In order to re-construct
  // correct whitespace between words reliably & language-independent, we need to 
  // match them against the original fulltext returned by Google Vison.
  const withCleanFullText = merged.reduce<{ text: string, boundingBox: [number, number][], index: number }[]>((result, { words, boundingBox }) => {
    const startIdx = result.length === 0 ? 0 : result[result.length - 1].index; 
    const { text, index } = clipFullText(words, fullText, startIdx);
    return [...result, { text, boundingBox, index }];
  }, []);

  console.log(withCleanFullText);
}

export const parseResponse = (
  data: any, 
  transform: PageTransform,
  _: Region | undefined,
  options: Record<string, any>
): ImageAnnotation[] => {
  const response = data.responses[0];

  if (!response) {
    console.error(data);
    throw new Error('Could not parse response');
  }

  if (response.error)
    throw new Error(response.error.message);

  mergeAnnotations(response, transform, 'paragraph');

  console.log(response);

  return response.textAnnotations
    .filter(({ locale }) => !locale)
    .map(({ description, boundingPoly: { vertices }}) =>
      toAnnotation(description, vertices, transform), []);
}