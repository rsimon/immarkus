import { useContext, useEffect, useMemo } from 'react';
import { AnnotoriousPlugin, OpenSeadragonAnnotator, OpenSeadragonViewer, W3CImageFormat, useViewer } from '@annotorious/react';
import { Annotorious, OSDViewerContext } from '@annotorious/react-manifold';
import { mountExtension as SelectorPack } from '@annotorious/selector-pack';
import { LoadedImage } from '@/model';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';
import { Tool, ToolMode } from '../HeaderSection';
import { useSavingState } from '../SavingState';
import { useDrawingStyles } from './useDrawingStyles';

import '@annotorious/react/annotorious-react.css';

interface AnnotatableImageProps {

  image: LoadedImage;
  
  mode: ToolMode;

  tool: Tool;

}

/**
 * A simple shim that passes the OSD viewer instance upwards to the manifold.
 */
const ManifoldConnector = (props: { source: string }) => {

  const viewer = useViewer();

  const { setViewers } = useContext(OSDViewerContext);

  useEffect(() => {
    if (viewer) {
      setViewers(m => new Map(m.entries()).set(props.source, viewer));

      return () => {
        setViewers(m => new Map(Array.from(m.entries()).filter(([key, _]) => key !== props.source)));
      }
    }
  }, [viewer]);

  return null;

}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  const { setSavingState } = useSavingState();

  const { colorByEntity } = useDrawingStyles();

  const onSave = () => setSavingState({ value: 'saving' });

  const onSaved = () => setSavingState({ value: 'success' });

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
    maxZoomLevel: 1000
  }), [props.image.id]);

  const onError = (error: Error) => {
    console.error(error);

    setSavingState({
      value: 'failed',
      message: `Could not save the last annotation. Error: ${error.message}`
    });
  }
  
  return (
    <Annotorious source={props.image.id}>
      <OpenSeadragonAnnotator
        adapter={W3CImageFormat(props.image.name)}
        autoSave
        drawingMode="click"
        drawingEnabled={props.mode === 'draw'}
        style={colorByEntity}
        tool={props.tool}>

        <ManifoldConnector source={props.image.id} />

        <OpenSeadragonViewer
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