import { OpenSeadragonAnnotator, OpenSeadragonViewer, W3CImageFormat } from '@annotorious/react';
import { Image } from '@/model';
import { Annotorious } from '@annotorious/react-manifold';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';
import { Tool, ToolMode } from '../HeaderSection';

import '@annotorious/react/annotorious-react.css';

interface AnnotatableImageProps {

  image: Image;
  
  mode: ToolMode;

  tool: Tool;

  onSaving(): void;

  onSaved(): void;

  onSaveError(error: Error): void;

}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  return (
    <Annotorious source={props.image.id}>
      <OpenSeadragonAnnotator
        adapter={W3CImageFormat(props.image.name)}
        drawingMode="click"
        drawingEnabled={props.mode === 'draw'}
        tool={props.tool}>

        <OpenSeadragonViewer
          className="osd-container"
          options={{
            tileSources: {
              type: 'image',
              url: URL.createObjectURL(props.image.data)
            },
            gestureSettingsMouse: {
              clickToZoom: false
            },
            showNavigationControl: false,
            crossOriginPolicy: 'Anonymous'
          }} />

        <AnnotoriousStoragePlugin 
          imageId={props.image.id}
          onSaving={props.onSaving} 
          onSaved={props.onSaved}
          onError={props.onSaveError} />
      </OpenSeadragonAnnotator>
    </Annotorious>
  )

}