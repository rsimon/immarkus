import { useMemo } from 'react';
import type { OpenSeadragon } from 'openseadragon';
import { AnnotoriousPlugin, OpenSeadragonAnnotator } from '@annotorious/react';
import { Annotorious, OpenSeadragonViewer } from '@annotorious/react-manifold';
import { OSDConnectionPopup, OSDConnectorPlugin } from '@annotorious/plugin-connectors-react';
import { mountExtension as SelectorPack } from '@annotorious/selector-pack';
import { LoadedImage } from '@/model';
import { W3CImageRelationFormat } from '@/store';
import { ConnectorPopup } from '../ConnectorPopup';
import { Tool, ToolMode } from '../Tool';
import { useSavingState } from '../SavingState';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';
import { useDrawingStyles } from './useDrawingStyles';

import '@annotorious/react/annotorious-react.css';
import '@annotorious/plugin-connectors-react/annotorious-connectors-react.css';

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
      clickToZoom: false,
      dblClickToZoom: false
    },
    showNavigationControl: false,
    crossOriginPolicy: 'Anonymous',
    minZoomLevel: 0.1,
    maxZoomLevel: 100
  }), [props.image.id]);
  
  return (
    <Annotorious id={props.image.id}>
      <OpenSeadragonAnnotator
        adapter={W3CImageRelationFormat(props.image.name)}
        autoSave
        drawingMode="click"
        drawingEnabled={props.mode === 'draw'}
        style={colorByEntity}
        tool={props.tool}>

        <OpenSeadragonViewer
          id={props.windowId || props.image.id}
          className="osd-container"
          options={options} />

        <OSDConnectorPlugin 
          enabled={props.mode === 'connect'}>
          <OSDConnectionPopup popup={props => (
            <ConnectorPopup {...props} />
          )} />
        </OSDConnectorPlugin>

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