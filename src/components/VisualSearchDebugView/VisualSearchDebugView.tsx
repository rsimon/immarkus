import { useEffect, useMemo } from 'react';
import type { IndexedImageSegment } from 'browser-visual-search';
import { Annotorious, OpenSeadragonAnnotator, OpenSeadragonViewer, useAnnotator } from '@annotorious/react';
import type { AnnotationState, DrawingStyleExpression, ImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { Dialog, DialogContent, DialogTitle } from '@/ui/Dialog';
import { getOSDTilesets } from '@/utils/iiif';
import { useVisualSearch } from '@/utils/useVisualSearch';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';

export interface VisualSearchDebugDialogProps {

  image: LoadedImage;

  open: boolean;

  onOpenChange(open: boolean): void;

}

interface VisualSearchDebugViewerProps {

  image: LoadedImage;

}

export const getBounds = (segment: IndexedImageSegment, image: LoadedImage) => {
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

const VisualSearchDebugViewer = (props: VisualSearchDebugViewerProps) => {
  const vs = useVisualSearch();

  const anno = useAnnotator();

  const options: OpenSeadragon.Options = useMemo(() => ({
    tileSources: 'data' in props.image ? {
      type: 'image',
      url: URL.createObjectURL(props.image.data)
    } as object : getOSDTilesets(props.image.canvas),
    gestureSettingsMouse: {
      clickToZoom: false,
      dblClickToZoom: false
    },
    crossOriginPolicy: 'Anonymous',
    showNavigationControl: false,
    minZoomLevel: 0.1,
    maxZoomLevel: 100
  }), [props.image]);

  const style: DrawingStyleExpression = useMemo(() => (_: ImageAnnotation, state: AnnotationState) => {
    return {
      fill: '#ff1493',
      fillOpacity: state?.hovered ? 0.2 : 0.02,
      stroke: '#ff1493',
      strokeOpacity: state?.hovered ? 0.7 : 0.2
    };
  }, []);

  useEffect(() => {
    if (!vs.index || !anno) return;

    const image = vs.index.getImage(props.image.id);
    if (!image) return;

    const annotations = image?.segments.map(segment => {
      const [x, y, w, h] = getBounds(segment, props.image);
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
  }, [vs, anno, props.image]);

  return (
    <OpenSeadragonAnnotator
      style={style}>
      <OpenSeadragonViewer
        options={options} 
        className="size-full bg-muted border rounded [&_div]:outline-none" />
    </OpenSeadragonAnnotator>
  )

}

export const VisualSearchDebugDialog = (props: VisualSearchDebugDialogProps) => {

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}>
      <DialogContent className="h-11/12 w-11/12 max-w-11/12 flex flex-col">
        <DialogTitle>
          {props.image.name}
        </DialogTitle>

        <div className="grow relative">
          <Annotorious>
            <VisualSearchDebugViewer
              image={props.image} />
          </Annotorious>
        </div>
      </DialogContent>
    </Dialog>
  )

}