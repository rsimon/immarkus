import { useContext, useEffect } from 'react';
import { AnnotoriousPlugin, OpenSeadragonAnnotator, OpenSeadragonViewer, W3CImageFormat, useViewer } from '@annotorious/react';
import { Annotorious } from '@annotorious/react-manifold';
import { mountExtension as SelectorPack } from '@annotorious/selector-pack';
import { Image } from '@/model';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';
import { Tool, ToolMode } from '../HeaderSection';
import { OSDViewerContext } from '../OSDViewerManifold';
import { useSavingState } from '../SavingState';

import '@annotorious/react/annotorious-react.css';

interface AnnotatableImageProps {

  image: Image;
  
  mode: ToolMode;

  tool: Tool;

}

/**
 * A simple shim that passes the OSD viewer instance upwards to the manifold.
 */
const ManifoldConnector = () => {

  const viewer = useViewer();

  const { setViewers } = useContext(OSDViewerContext);

  useEffect(() => {
    if (viewer) {
      setViewers(viewers => [...viewers, viewer]);

      return () => {
        setViewers(viewers => viewers.filter(v => v !== viewer));
      }
    }
  }, [viewer]);

  return null;

}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  const { setSavingState } = useSavingState();

  const onSave = () => setSavingState({ value: 'saving' });

  const onSaved = () => setSavingState({ value: 'success' });

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
        drawingMode="click"
        drawingEnabled={props.mode === 'draw'}
        tool={props.tool}>

        <ManifoldConnector />

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