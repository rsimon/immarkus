import { useMemo } from 'react';
import type { OpenSeadragon } from 'openseadragon';
import { AnnotoriousPlugin, OpenSeadragonAnnotator, W3CImageFormat } from '@annotorious/react';
import { Annotorious, OpenSeadragonViewer } from '@annotorious/react-manifold';
import { mountExtension as SelectorPack } from '@annotorious/selector-pack';
import { LoadedImage } from '@/model';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';
import { Tool, ToolMode } from '../Tool';
import { useSavingState } from '../SavingState';
import { useDrawingStyles } from './useDrawingStyles';

import '@annotorious/react/annotorious-react.css';

interface AnnotatableImageProps {

  image: LoadedImage;

  windowId?: string;
  
  mode: ToolMode;

  tool: Tool;

}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  const { setSavingState } = useSavingState();

  const { colorByEntity } = useDrawingStyles();

  const onSave = () => setSavingState({ value: 'saving' });

  const onSaved = () => setSavingState({ value: 'success' });

  const onError = (error: Error) => {
    console.error(error);

    setSavingState({
      value: 'failed',
      message: `Could not save the last annotation. Error: ${error.message}`
    });
  }

  const options: OpenSeadragon.Options = useMemo(() => ({
    tileSources: {
      type: 'image',
      url: URL.createObjectURL(props.image.data)
    },
    gestureSettingsMouse: {
      clickToZoom: false
    },
    showNavigationControl: false,
    crossOriginPolicy: 'Anonymous',
    minZoomLevel: 0.1,
    maxZoomLevel: 100
  }), [props.image.id]);
  
  return (
    <Annotorious id={props.image.id}>
      <OpenSeadragonAnnotator
        adapter={W3CImageFormat(props.image.name)}
        autoSave
        drawingMode="click"
        drawingEnabled={props.mode === 'draw'}
        style={colorByEntity}
        tool={props.tool}>

        <OpenSeadragonViewer
          id={props.windowId || props.image.id}
          className="osd-container"
          options={options} />

        <AnnotoriousPlugin
          plugin={SelectorPack} />

        <AnnotoriousStoragePlugin 
          imageId={props.image.id}
          onSaving={onSave} 
          onSaved={onSaved}
          onError={onError} />
      </OpenSeadragonAnnotator>
    </Annotorious>
  )

}