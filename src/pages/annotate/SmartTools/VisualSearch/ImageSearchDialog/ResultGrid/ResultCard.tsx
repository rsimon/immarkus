import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ImageAnnotation, Rectangle, ShapeType } from '@annotorious/react';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { getImageColor, THIS_IMAGE_COLOR } from '../ImageSearchPalette';

interface ResultCardProps {

  data: ResolvedSearchResult;

}

export const ResultCard = (props: ResultCardProps) => {

  const { bbox, image, isQueryImage, score } = props.data;

  const [snippet, setSnippet] = useState<ImageSnippet | undefined>();

  const backgroundColor = isQueryImage ? THIS_IMAGE_COLOR : getImageColor(image.id);

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

  return snippet && 'data' in snippet ? (
    <div className="w-full rounded-xs overflow-hidden relative shadow-xs">
      <img
        className="w-full"
        src={URL.createObjectURL(new Blob([snippet.data as BlobPart]))} />

      <div 
        className="size-3 absolute inset-0.75 rounded-full border border-white" 
        style={{ backgroundColor }} />

      <div
        className="absolute bottom-0 left-0 text-white text-[10px] bg-black/60 py-0.5 px-1.5 rounded-tr-xs">
        {Math.round(score * 100) / 100}
      </div>
    </div>
  ) : (
    <div />
  )

}