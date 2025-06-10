import { useEffect, useMemo } from 'react';
import { LoadedImage } from '@/model';
import { getOSDTilesets } from '@/utils/iiif';
import { HoverTooltip } from './HoverTooltip';
import { ResultBadge } from './ResultBadge';
import { 
  DrawingStyle, 
  ImageAnnotation, 
  OpenSeadragonAnnotator, 
  OpenSeadragonHoverTooltip, 
  OpenSeadragonViewer, 
  useAnnotator, 
  UserSelectAction 
} from '@annotorious/react';

interface TranscriptionPreviewProps {

  annotations?: ImageAnnotation[];

  image: LoadedImage;

  onImportAnnotations(): void;

}

export const TranscriptionPreview = (props: TranscriptionPreviewProps) => {

  const { image } = props;

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

  const style: DrawingStyle = useMemo(() => ({
    fill: '#FF1493',
    fillOpacity: 0.18,
    stroke: '#FF1493',
    strokeOpacity: 0.45
  }), []);

  useEffect(() => {
    if (!props.annotations || !anno) return;
    anno.setAnnotations(props.annotations);
  }, [props.annotations, anno]);

  return (
    <div className="relative h-full w-full">
      {props.annotations && ( 
        <ResultBadge 
          count={props.annotations.length} 
          onImport={props.onImportAnnotations} />
      )}

      <OpenSeadragonAnnotator
        userSelectAction={UserSelectAction.NONE}
        style={style}>
        <OpenSeadragonViewer
          className="h-full w-full"
          options={options} />

        <OpenSeadragonHoverTooltip 
          tooltip={props => (
            <HoverTooltip {...props} /> 
          )}/>
      </OpenSeadragonAnnotator>
    </div>
  )

}