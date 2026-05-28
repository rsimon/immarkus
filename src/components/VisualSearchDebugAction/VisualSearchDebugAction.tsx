import { useEffect, useMemo, useState } from 'react';
import { Bug } from 'lucide-react';
import type { IndexedImageSegment } from 'browser-visual-search';
import { Annotorious, OpenSeadragonAnnotator, OpenSeadragonViewer, useAnnotator } from '@annotorious/react';
import type { AnnotationState, DrawingStyleExpression, ImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { useImages } from '@/store';
import { Dialog, DialogContent, DialogTitle } from '@/ui/Dialog';
import { getOSDTilesets } from '@/utils/iiif';
import { useVisualSearch, useVisualSearchAvailable } from '@/utils/useVisualSearch';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/ui/DropdownMenu';

interface VisualSearchDebugActionProps {

  title: string;

  imageId: string;

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

interface VisualSearchDebugViewerProps {

  imageId: string;

}

const VisualSearchDebugViewer = (props: VisualSearchDebugViewerProps) => {
  const image = useImages(props.imageId) as LoadedImage;

  const vs = useVisualSearch();

  const anno = useAnnotator();

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

  return image ? (
    <OpenSeadragonAnnotator
      style={style}>
      <OpenSeadragonViewer
        options={options} 
        className="size-full bg-muted border rounded [&_div]:outline-none" />
    </OpenSeadragonAnnotator>
  ) : null;

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
      <DropdownMenuSeparator />

      <DropdownMenuItem onSelect={onOpenVSDebug}>
        <Bug className="size-4 mr-2 text-amber-500" />
        Inspect indexed patches
      </DropdownMenuItem>


      <Dialog
        open={showVisualSearchDebug}
        onOpenChange={setShowVisualSearchDebug}>
        <DialogContent className="h-11/12 w-11/12 max-w-11/12 flex flex-col">
          <DialogTitle>
            {props.title}
          </DialogTitle>

          <div className="grow relative">
            <Annotorious>
              <VisualSearchDebugViewer
                imageId={props.imageId} />
            </Annotorious>
          </div>
        </DialogContent>
      </Dialog>
    </>
  ) : null;

}