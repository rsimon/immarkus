import { useEffect, useMemo, useState } from 'react';
import { IndexedImageSegment } from 'browser-visual-search';
import { LoadedImage } from '@/model';
import { useImages } from '@/store';
import { getOSDTilesets } from '@/utils/iiif';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { useVisualSearch } from '@/utils/useVisualSearch';
import { VisualSearchDebugToolbar } from './VisualSearchDebugToolbar';
import { 
  AnnotationState, 
  DrawingStyleExpression, 
  ImageAnnotation, 
  OpenSeadragonAnnotator, 
  OpenSeadragonViewer, 
  useAnnotator 
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

  const anno = useAnnotator();

  const [selected, setSelected] = useState<ImageAnnotation[]>([]);

  const options: OpenSeadragon.Options = useMemo(() => {
    if (!image) return;

    return {
      tileSources: 'data' in image ? {
        type: 'image',
        url: URL.createObjectURL(image.data)
      } as object : getOSDTilesets(image.canvas),
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: false
      },
      crossOriginPolicy: 'Anonymous',
      showNavigationControl: false,
      minZoomLevel: 0.1,
      maxZoomLevel: 100
    }
  }, [image]);

  const style: DrawingStyleExpression = useMemo(() => (_: ImageAnnotation, state: AnnotationState) => {
    return {
      fill: '#ff1493',
      fillOpacity: state?.hovered ? 0.2 : 0.02,
      stroke: '#ff1493',
      strokeOpacity: state?.hovered ? 0.9 : 0.65
    };
  }, []);

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
      });
    });

    anno.setAnnotations(annotations);

    return () => {
      anno.clearAnnotations();
    }
  }, [vs, anno, image]);

  const onImportSelected = () => {

  }

  return image ? (
    <OpenSeadragonAnnotator
      style={style}>
      <OpenSeadragonViewer
        options={options} 
        className="size-full bg-muted border rounded [&_div]:outline-none" />

      <VisualSearchDebugToolbar 
        selected={selected} 
        onImportSelected={onImportSelected} />
    </OpenSeadragonAnnotator>
  ) : null;

}