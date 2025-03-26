import { useEffect, useMemo } from 'react';
import type OpenSeadragon from 'openseadragon';
import type { History } from '@annotorious/core';
import { Annotorious, OpenSeadragonViewer } from '@annotorious/react-manifold';
import { OSDConnectionPopup, OSDConnectorPlugin, W3CImageRelationFormat } from '@annotorious/plugin-connectors-react';
import { mountPlugin as SelectorPack } from '@annotorious/plugin-tools';
import { LoadedImage } from '@/model';
import { getOSDTilesets } from '@/utils/iiif';
import { ConnectorPopup } from '../ConnectorPopup';
import { AnnotoriousRelationEditorPlugin, useRelationEmphasisStyle } from '../RelationEditor';
import { AnnotationMode, Tool } from '../AnnotationMode';
import { useSavingState } from '../SavingState';
import { AnnotoriousKeyboardPlugin } from './AnnotoriousKeyboardPlugin';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';
import { useDrawingStyles } from './useDrawingStyles';
import { 
  AnnotoriousOpenSeadragonAnnotator, 
  AnnotoriousPlugin, 
  ImageAnnotation,
  OpenSeadragonAnnotator, 
  UserSelectAction, 
  useAnnotator 
} from '@annotorious/react';

import '@annotorious/react/annotorious-react.css';
import '@annotorious/plugin-connectors-react/annotorious-connectors-react.css';

import { ColorSampler } from './ColorSampler';

const ENABLE_CONNECTOR_PLUGIN = import.meta.env.VITE_ENABLE_CONNECTOR_PLUGIN === 'true';

if (ENABLE_CONNECTOR_PLUGIN)
  console.log('[Experimental] Connector plugin enabled')

interface AnnotatableImageProps {

  image: LoadedImage;

  initialHistory: History<ImageAnnotation>;

  windowId?: string;
  
  mode: AnnotationMode;

  tool: Tool;

  onUnmount(history: History<ImageAnnotation>): void;

}

interface HistoryConsumerProps {

  onUnmount(history: History<ImageAnnotation>): void;

}

const HistoryConsumer = (props: HistoryConsumerProps) => {

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  useEffect(() => {
    if (!anno) return;

    return () => {
      props.onUnmount(anno.getHistory())
    }
  }, [anno]);

  return null;

}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  const { image } = props;

  const { setSavingState } = useSavingState();

  const { colorByEntity } = useDrawingStyles();

  const style = useRelationEmphasisStyle(props.mode === 'relation', colorByEntity);

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
  
  return (
    <Annotorious id={props.image.id}>
      <OpenSeadragonAnnotator
        autoSave
        multiSelect
        adapter={W3CImageRelationFormat('canvas' in image ? image.id : image.name)}
        drawingMode="click"
        drawingEnabled={props.mode === 'draw'}
        initialHistory={props.initialHistory}
        userSelectAction={(props.mode === 'relation' || props.mode === 'smart') ? UserSelectAction.NONE : undefined}
        style={style}
        tool={props.tool}>

        <HistoryConsumer 
          onUnmount={props.onUnmount} />

        <ColorSampler />

        <OpenSeadragonViewer
          id={props.windowId || props.image.id}
          className="osd-container"
          options={options} />

        <AnnotoriousPlugin
          plugin={SelectorPack} />

        {ENABLE_CONNECTOR_PLUGIN ? (
          <OSDConnectorPlugin 
            enabled={props.mode === 'relation'}>
            <OSDConnectionPopup popup={props => (
              <ConnectorPopup {...props} />
            )} />
          </OSDConnectorPlugin>
        ) : (
          <AnnotoriousRelationEditorPlugin
            enabled={props.mode === 'relation'} />
        )}

        <AnnotoriousKeyboardPlugin />

        <AnnotoriousStoragePlugin 
          imageId={image.id}
          onSaving={onSave} 
          onSaved={onSaved}
          onError={onError} />
      </OpenSeadragonAnnotator>
    </Annotorious>
  )

}