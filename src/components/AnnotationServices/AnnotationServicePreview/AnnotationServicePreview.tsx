import { useEffect, useMemo } from 'react';
import { LoadedImage } from '@/model';
import { Region, Rotation } from '@/services';
import { getOSDTilesets } from '@/utils/iiif';
import { AnnotationServiceInput, AnnotationServiceStatus } from '../Types';
import { HoverTooltip } from './HoverTooltip';
import { NavControls } from './NavControls';
import { ResultBadge } from './ResultBadge';
import { SelectRegion } from './SelectRegion';
import { 
  DrawingStyle, 
  ImageAnnotation, 
  OpenSeadragonAnnotator, 
  OpenSeadragonHoverTooltip, 
  OpenSeadragonViewer, 
  useAnnotator, 
  UserSelectAction 
} from '@annotorious/react';

interface AnnotationServicePreviewProps {

  annotations?: ImageAnnotation[];

  image: LoadedImage;

  status?: AnnotationServiceStatus;

  onUpdateInput(patch: Partial<AnnotationServiceInput>): void;

  onClearAnnotations(): void;

  onImportAnnotations(): void;

}

export const AnnotationServicePreview = (props: AnnotationServicePreviewProps) => {

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
    if (!anno) return;

    if (props.annotations) {
      anno.setAnnotations(props.annotations);
    } else {
      anno.clearAnnotations();
    }
  }, [props.annotations, anno]);

  const onChangeRegion = (region: Region) => props.onUpdateInput({ region });

  const onChangeRotation = (rotation: Rotation) => props.onUpdateInput({ rotation });

  const onChangeFlipped = (isFlipped: boolean) => props.onUpdateInput({ isFlipped });

  return (
    <div className="relative h-full w-full">
      {props.annotations && ( 
        <ResultBadge 
          count={props.annotations.length} 
          onClear={props.onClearAnnotations}
          onImport={props.onImportAnnotations} />
      )}

      <OpenSeadragonAnnotator
        userSelectAction={UserSelectAction.NONE}
        style={style}>
        <OpenSeadragonViewer
          className="h-full w-full"
          options={options} />

        <SelectRegion 
          processingState={props.status?.state}
          onChangeRegion={onChangeRegion} />

        <NavControls 
          onChangeRotation={onChangeRotation} 
          onChangeFlipped={onChangeFlipped} />

        <OpenSeadragonHoverTooltip 
          tooltip={props => (
            <HoverTooltip {...props} /> 
          )}/>
      </OpenSeadragonAnnotator>
    </div>
  )

}