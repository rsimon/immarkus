import { useCallback, useMemo } from 'react';
import { AnnotationState, DrawingStyle, ImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { useAnnotations } from '@/store';
import { getOSDTilesets } from '@/utils/iiif';

export const useVisualSearchDebugView = (image: LoadedImage, selected: ImageAnnotation[]) => {
  const annotations = useAnnotations(image?.id, { type: 'image' });

  const options: OpenSeadragon.Options = useMemo(() => {
    if (!image?.id) return;

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
  }, [image?.id]);

  const style = useCallback((annotation: ImageAnnotation, state: AnnotationState): DrawingStyle => {
    const isAnnotation = annotations.some(a => a.id === annotation.id);

    const isSelected = !isAnnotation && selected.some(a => a.id === annotation.id);

    return isAnnotation ? {
      fill: '#1a1a1a',
      fillOpacity: 0.05,
      stroke: '#1a1a1a',
      strokeOpacity: state?.hovered ? 1 : 0.8
    } : isSelected ? {
      fill: '#0a942c',
      fillOpacity: state?.hovered ? 0.65 : 0.55,
      stroke: '#0a942c',
      strokeOpacity: state?.hovered ? 1 : 0.8
    } : {
      fill: '#ff1493',
      fillOpacity: state?.hovered ? 0.2 : 0.02,
      stroke: '#ff1493',
      strokeOpacity: state?.hovered ? 0.9 : 0.65
    }
  }, [selected, annotations]);

  return { options, style };

}