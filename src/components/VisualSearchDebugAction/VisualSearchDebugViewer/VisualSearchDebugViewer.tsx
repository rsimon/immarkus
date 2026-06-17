import { useEffect, useState } from 'react';
import { IndexedImageSegment } from 'browser-visual-search';
import { LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { getDeterministicId, useVisualSearch } from '@/utils/useVisualSearch';
import { VisualSearchDebugToolbar } from './VisualSearchDebugToolbar';
import { useVisualSearchDebugView } from './useVisualSearchDebugView';
import { 
  ImageAnnotation, 
  OpenSeadragonAnnotator, 
  OpenSeadragonViewer, 
  serializeW3CImageAnnotation, 
  useAnnotator, 
  UserSelectAction
} from '@annotorious/react';

interface VisualSearchDebugViewerProps {

  imageId: string;

}

const getBounds = (segment: IndexedImageSegment, image: LoadedImage) => {
  if ('canvas' in image) {
    const { width, height} = image.canvas;
    const [ nx, ny, nw, nh ] = segment.normalizedBounds;

    const x = nx * width;
    const y = ny * height;
    const w = nw * width;
    const h = nh * height;

    return [x, y, w, h];
  } else {
    return segment.pxBounds;
  }
}

export const VisualSearchDebugViewer = (props: VisualSearchDebugViewerProps) => {

  const image = useImages(props.imageId) as LoadedImage;

  const vs = useVisualSearch();

  const store = useStore();

  const anno = useAnnotator();

  const [selected, setSelected] = useState<ImageAnnotation[]>([]);

  const { options, style } = useVisualSearchDebugView(image, selected);

  useEffect(() => {
    if (!vs.index || !anno || !image) return;

    const indexedImage = vs.index.getImage(image.id);
    if (!indexedImage) return;

    const annotations = indexedImage.segments.map(segment => {
      const [x, y, w, h] = getBounds(segment, image);
      return boundsToAnnotation({
        minX: x, 
        minY: y,
        maxX: x + w,
        maxY: y + h
      }, getDeterministicId(image.id, segment.pxBounds));
    });

    anno.setAnnotations(annotations);

    return () => {
      anno.clearAnnotations();
    }
  }, [vs, anno, image]);

  useEffect(() => {
    if (!anno) return;

    const onClick = (annotation: ImageAnnotation) => {
      setSelected(current => {
        if (current.some(a => a.id === annotation.id)) {
          return current.filter(a => a.id !== annotation.id);
        } else {
          return [...current, annotation];
        }
      });
    }

    anno.on('clickAnnotation', onClick);

    return () => {
      anno?.off('clickAnnotation', onClick);
    }
  }, [anno]);

  const onImportSelected = () => {
    const w3c = selected.map(a => serializeW3CImageAnnotation(a, image.id));
    store.bulkUpsertAnnotation(image.id, w3c);
  }

  return options ? (
    <OpenSeadragonAnnotator
      style={style}
      userSelectAction={UserSelectAction.SELECT}>
      <OpenSeadragonViewer
        options={options} 
        className="size-full bg-muted border rounded [&_div]:outline-none" />

      <VisualSearchDebugToolbar 
        selected={selected} 
        onImportSelected={onImportSelected} />
    </OpenSeadragonAnnotator>
  ) : null;

}