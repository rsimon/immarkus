import { useMemo } from 'react';
import { DrawingStyle, OpenSeadragonAnnotator, OpenSeadragonViewer, UserSelectAction } from '@annotorious/react';
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

  const style: DrawingStyle = useMemo(() => ({
    fill: '#FF1493',
    fillOpacity: 0.18,
    stroke: '#FF1493',
    strokeOpacity: 0.45
  }), []);

  return (
    <div className="relative h-full w-full">
      <h2 className="absolute top-2 left-2 z-10 bg-black text-white text-sm rounded px-3 py-1.5">
        Preview
      </h2>

      <OpenSeadragonAnnotator
        userSelectAction={UserSelectAction.NONE}
        style={style}>
        <OpenSeadragonViewer
          className="h-full w-full"
          options={options} />
      </OpenSeadragonAnnotator>
    </div>
  )

}