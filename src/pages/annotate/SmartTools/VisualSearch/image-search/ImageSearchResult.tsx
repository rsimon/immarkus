import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ImageAnnotation, Rectangle, ShapeType } from '@annotorious/react';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { ResolvedSearchResult } from './ImageSearchDialog';

interface ImageSearchResultProps {

  data: ResolvedSearchResult;

}

export const ImageSearchResult = (props: ImageSearchResultProps) => {

  const { bbox, image, score } = props.data;

  const [snippet, setSnippet] = useState<ImageSnippet | undefined>();

  useEffect(() => {
    if (!('data' in image)) return;
    
    // bbox coordinates are normalized [0, 1] - note that
    // this code is an inefficent hack!
    createImageBitmap(image.data).then(bitmap => {
      const { width, height } = bitmap;
      bitmap.close();

      const x = bbox[0] * width;
      const y = bbox[1] * height;
      const w = bbox[2] * width;
      const h = bbox[3] * height;

      // Create a dummy annotation, so we can re-use 
      // the getImageSnippet function
      const selector: Rectangle = {
        type: ShapeType.RECTANGLE,
        geometry: {
          x,
          y,
          w,
          h,
          bounds: {
            minX: x,
            minY: y,
            maxX: x + w,
            maxY: y + h
          }
        }
      };

      const id = uuidv4();

      const annotation: ImageAnnotation = {
        id,
        bodies: [],
        target: {
          annotation: id,
          selector
        }
      };

      getImageSnippet(image, annotation, true, 'jpg')
        .then(setSnippet);
    });
  }, [image, bbox]);

  return (
    <div className="w-full rounded-sm overflow-hidden border">
      {(snippet && 'data' in snippet) ? (
        <img
          className="w-full"
          src={URL.createObjectURL(new Blob([snippet.data as BlobPart]))} />
      ) : (
        <div className="size-8 bg-red-300 border-green-300" />
      )}
    </div>
  )

}