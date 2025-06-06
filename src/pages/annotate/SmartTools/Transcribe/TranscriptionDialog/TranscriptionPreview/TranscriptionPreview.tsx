import { useMemo } from 'react';
import { OpenSeadragonAnnotator, OpenSeadragonViewer, UserSelectAction } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { getOSDTilesets } from '@/utils/iiif';

interface TranscriptionPreviewProps {

  image: LoadedImage;

}

export const TranscriptionPreview = (props: TranscriptionPreviewProps) => {

  const { image } = props;

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

  const style = useMemo(() => {
    // TOOD
    return undefined;
  }, []);

  return (
    <OpenSeadragonAnnotator
      userSelectAction={UserSelectAction.NONE}
      style={style}>
      <OpenSeadragonViewer
        className="h-full w-full"
        options={options} />
    </OpenSeadragonAnnotator>
  )

}