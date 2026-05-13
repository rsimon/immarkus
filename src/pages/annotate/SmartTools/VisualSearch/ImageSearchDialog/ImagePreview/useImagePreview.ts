import { useCallback, useMemo } from 'react';
import { LoadedImage } from '@/model';
import { getOSDTilesets } from '@/utils/iiif';
import { AnnotationState, DrawingStyle, ImageAnnotation } from '@annotorious/react';

export const useImagePreview = (image: LoadedImage, selected: ImageAnnotation[]) => {

  const options: OpenSeadragon.Options = useMemo(() => ({
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
  }), [image.id]);

  const style = useCallback((annotation: ImageAnnotation, state: AnnotationState): DrawingStyle => {
    const isSearchResult = 
      annotation.bodies.find(b => b.purpose === 'tagging' && b.value === 'search-result');

    const isEmphasized =
      annotation.bodies.find(b => b.purpose === 'classifying' && b.value === 'emphasized');

    const isSelected = isSearchResult && selected.some(a => a.id === annotation.id);

    if (isSearchResult) {
      return isSelected ? {
        fill: '#ff1493',
        fillOpacity: state?.hovered ? 0.35 : 0.2,
        stroke: '#ff1493',
        strokeOpacity: state?.hovered ? 0.9 : 0.75
      } : isEmphasized ? {
        fill: '#00f06f',
        fillOpacity: state?.hovered ? 0.35 : 0.1,
        stroke: '#00f06f',
        strokeWidth: 3,
        strokeOpacity: state?.hovered ? 0.9 : 0.75        
      } : {
        fill: '#111',
        fillOpacity: state?.hovered ? 0.5 : 0.25,
        stroke: '#fff',
        strokeOpacity: state?.hovered ? 0.95 : 0.8
      }
    } else {
      return {
        fillOpacity: 0,
        stroke: '#1a1a1a',
        strokeWidth: 1.5,
        strokeOpacity: 0.9
      }
    }
  }, [selected]);

  return { options, style };

}