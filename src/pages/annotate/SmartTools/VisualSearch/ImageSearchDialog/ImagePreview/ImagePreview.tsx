import { useEffect, useMemo } from 'react';
import { OpenSeadragonAnnotator, OpenSeadragonViewer, useAnnotator, UserSelectAction } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { getOSDTilesets } from '@/utils/iiif';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';

interface ImagePreviewProps {

  image: LoadedImage;

  results: ResolvedSearchResult[];

}

export const ImagePreview = (props: ImagePreviewProps) => {

  const { image, results } = props;

  const anno = useAnnotator();

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

  useEffect(() => {
    if (!anno) return;

    const annotations = results
      .filter(r => r.imageId === image.id)
      .map(r => {
        const [ x, y, w, h] = r.pxBounds;
        
        return boundsToAnnotation({
          minX: x, 
          minY: y,
          maxX: x + w,
          maxY: y + h
        });
      });

    anno.setAnnotations(annotations, true);
  }, [anno, image, results]);

  return (
    <div className="relative size-full bg-white p-2">
      <div className="bg-muted size-full rounded border">
        <OpenSeadragonAnnotator
          userSelectAction={UserSelectAction.SELECT}>
          <OpenSeadragonViewer
            className="h-full w-full"
            options={options} />
        </OpenSeadragonAnnotator>
      </div>
    </div> 
  )

}