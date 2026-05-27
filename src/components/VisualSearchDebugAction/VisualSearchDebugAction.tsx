import { useEffect, useMemo, useState } from 'react';
import type { IndexedImageSegment } from 'browser-visual-search';
import { Annotorious, OpenSeadragonAnnotator, OpenSeadragonViewer, useAnnotator } from '@annotorious/react';
import type { AnnotationState, DrawingStyleExpression, ImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { Dialog, DialogContent, DialogTitle } from '@/ui/Dialog';
import { getOSDTilesets } from '@/utils/iiif';
import { useVisualSearch, useVisualSearchAvailable } from '@/utils/useVisualSearch';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { DropdownMenuItem } from '@/ui/DropdownMenu';
import { Bug } from 'lucide-react';

interface VisualSearchDebugActionProps {

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

const VisualSearchDebugViewer = (props: VisualSearchDebugActionProps) => {
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

export const VisualSearchDebugAction = (props: VisualSearchDebugActionProps) => {
  const hasVisualSearch = useVisualSearchAvailable();
  const [showVisualSearchDebug, setShowVisualSearchDebug] = useState(false);

  const onOpenVSDebug = (e: Event) => {
    e.preventDefault();
    setShowVisualSearchDebug(true);
  }

  if (!hasVisualSearch) {
    return null;
  }

  return hasVisualSearch ? (
    <>
      <DropdownMenuItem onSelect={onOpenVSDebug}>
        <Bug className="size-4 text-muted-foreground mr-2" />
        Inspect visual search index
      </DropdownMenuItem>

      <Dialog
        open={showVisualSearchDebug}
        onOpenChange={setShowVisualSearchDebug}>
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
    </>
  ) : null;
  
}