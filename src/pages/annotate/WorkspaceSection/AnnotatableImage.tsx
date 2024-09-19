import { useMemo } from 'react';
import type OpenSeadragon from 'openseadragon';
import { AnnotoriousPlugin, OpenSeadragonAnnotator, UserSelectAction } from '@annotorious/react';
import { Annotorious, OpenSeadragonViewer } from '@annotorious/react-manifold';
import { OSDConnectionPopup, OSDConnectorPlugin, W3CImageRelationFormat } from '@annotorious/plugin-connectors-react';
import { mountExtension as SelectorPack } from '@annotorious/selector-pack';
import { LoadedImage } from '@/model';
import { ConnectorPopup } from '../ConnectorPopup';
import { AnnotoriousRelationEditorPlugin, useRelationEmphasisStyle } from '../HeaderSection';
import { Tool, ToolMode } from '../Tool';
import { useSavingState } from '../SavingState';
import { AnnotoriousKeyboardPlugin } from './AnnotoriousKeyboardPlugin';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';
import { useDrawingStyles } from './useDrawingStyles';

import '@annotorious/react/annotorious-react.css';
import '@annotorious/plugin-connectors-react/annotorious-connectors-react.css';

const ENABLE_CONNECTOR_PLUGIN = import.meta.env.VITE_ENABLE_CONNECTOR_PLUGIN === 'true';

if (ENABLE_CONNECTOR_PLUGIN)
  console.log('[Experimental] Connector plugin enabled')

interface AnnotatableImageProps {

  image: LoadedImage;

  windowId?: string;
  
  mode: ToolMode;

  tool: Tool;

}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  const { setSavingState } = useSavingState();

  const { colorByEntity } = useDrawingStyles();

  const style = useRelationEmphasisStyle(props.mode === 'connect', colorByEntity);

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
        userSelectAction={props.mode === 'connect' ? UserSelectAction.NONE : undefined}
        style={style}
        tool={props.tool}>

        <OpenSeadragonViewer
          id={props.windowId || props.image.id}
          className="osd-container"
          options={options} />

        <AnnotoriousPlugin
          plugin={SelectorPack} />

        {ENABLE_CONNECTOR_PLUGIN ? (
          <OSDConnectorPlugin 
            enabled={props.mode === 'connect'}>
            <OSDConnectionPopup popup={props => (
              <ConnectorPopup {...props} />
            )} />
          </OSDConnectorPlugin>
        ) : (
          <AnnotoriousRelationEditorPlugin
            enabled={props.mode === 'connect'} />
        )}

        <AnnotoriousKeyboardPlugin />

        <AnnotoriousStoragePlugin 
          imageId={props.image.id}
          onSaving={onSave} 
          onSaved={onSaved}
          onError={onError} />
      </OpenSeadragonAnnotator>
    </Annotorious>
  )

}