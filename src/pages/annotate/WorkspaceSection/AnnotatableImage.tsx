import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import OpenSeadragon from 'openseadragon';
import type { History } from '@annotorious/core';
import { Annotorious, OpenSeadragonViewer, useViewers } from '@annotorious/react-manifold';
import { W3CImageRelationFormat } from '@annotorious/plugin-wires-react';
import { mountPlugin as SelectorPack } from '@annotorious/plugin-tools';
import { mountPlugin as MagneticOutlinePlugin } from '@annotorious/plugin-magnetic-outline';
import { LoadedImage } from '@/model';
import type { ImageViewport } from '@/store';
import { getOSDTilesets } from '@/utils/iiif';
import { AnnotoriousRelationEditorPlugin, useRelationEmphasisStyle } from '../RelationEditor';
import { AnnotationMode, Tool } from '../AnnotationMode';
import { useSavingState } from '../SavingState';
import { AnnotoriousKeyboardPlugin } from './AnnotoriousKeyboardPlugin';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';
import { useDrawingStyles } from './useDrawingStyles';
import { useAnnotationViewState } from '../AnnotationViewState';
import { 
  AnnotoriousOpenSeadragonAnnotator, 
  AnnotoriousPlugin, 
  ImageAnnotation,
  OpenSeadragonAnnotator, 
  UserSelectAction, 
  useAnnotator 
} from '@annotorious/react';

import '@annotorious/react/annotorious-react.css';
import '@annotorious/plugin-tools/annotorious-plugin-tools.css';
import '@annotorious/plugin-wires-react/annotorious-wires-react.css';
import '@annotorious/plugin-magnetic-outline/plugin-magnetic-outline.css';

interface AnnotatableImageProps {

  image: LoadedImage;

  hideAnnotations: boolean;

  initialHistory: History<ImageAnnotation>;

  mode?: AnnotationMode;

  tool: Tool;

  onInitError(error: Error): void;

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

const restoreInitialViewport = (viewer: OpenSeadragon.Viewer, viewport: ImageViewport) => {
  viewer.viewport.zoomTo(viewport.zoom, undefined, true);
  viewer.viewport.panTo(new OpenSeadragon.Point(viewport.center.x, viewport.center.y), true);
  viewer.viewport.applyConstraints();
}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  const { t } = useTranslation('annotate');

  const { image } = props;

  const viewers = useViewers();

  const viewer = viewers.get(image.id);

  const { initialViewports, clearInitialViewport } = useAnnotationViewState();

  const previousImageId = useRef(image.id);

  useEffect(() => {
    const imageChanged = previousImageId.current !== image.id;
    previousImageId.current = image.id;

    const savedViewport = initialViewports[image.id];
    if (!viewer || !savedViewport) return;

    const restore = () => {
      restoreInitialViewport(viewer, savedViewport);
      clearInitialViewport(image.id);
    };

    if (!imageChanged && viewer.isOpen()) {
      restore();
    } else if (imageChanged && viewer.isOpen()) {
      let animationFrame: number;

      const onAddItem = () => {
        viewer.world.removeHandler('add-item', onAddItem);
        animationFrame = requestAnimationFrame(restore);
      };

      viewer.world.addHandler('add-item', onAddItem);
      return () => {
        viewer.world.removeHandler('add-item', onAddItem);
        cancelAnimationFrame(animationFrame);
      };
    } else {
      viewer.addOnceHandler('open', restore);
      return () => viewer.removeHandler('open', restore);
    }
  }, [clearInitialViewport, image.id, initialViewports, viewer]);

  const { setSavingState } = useSavingState();

  const { colorByEntity } = useDrawingStyles();

  const style = useRelationEmphasisStyle(props.mode === 'relation', colorByEntity);

  const onSave = () => setSavingState({ value: 'saving' });

  const onSaved = () => setSavingState({ value: 'success' });

  const onError = (error: Error) => {
    console.error(error);

    setSavingState({
      value: 'failed',
      message: t('savingState.couldNotSaveAnnotation', { message: error.message })
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
        hideAnnotations={props.hideAnnotations}
        adapter={W3CImageRelationFormat('canvas' in image ? image.id : image.name)}
        drawingMode="click"
        drawingEnabled={props.mode === 'draw'}
        initialHistory={props.initialHistory}
        userSelectAction={(props.mode === 'relation' || !props.mode) ? UserSelectAction.NONE : undefined}
        style={style}
        tool={props.tool}
        onInitError={props.onInitError}>

        <HistoryConsumer 
          onUnmount={props.onUnmount} />

        <OpenSeadragonViewer
          key={image.id}
          id={image.id}
          className="osd-container"
          options={options} />

        <AnnotoriousPlugin
          plugin={SelectorPack} />

        <AnnotoriousPlugin
          plugin={MagneticOutlinePlugin} />

        <AnnotoriousRelationEditorPlugin
          enabled={props.mode === 'relation'} />

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