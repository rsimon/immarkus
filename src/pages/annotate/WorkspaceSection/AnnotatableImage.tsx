import { useEffect, useMemo } from 'react';
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
import { useAnnotationViewState } from '../AnnotationViewState';
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

  onViewportRestored(flipped: boolean): void;

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

const getCurrentViewport = (viewer: OpenSeadragon.Viewer): ImageViewport => {
  const center = viewer.viewport.getCenter(true);
  return {
    center: { x: center.x, y: center.y },
    zoom: viewer.viewport.getZoom(true),
    rotation: viewer.viewport.getRotation(true),
    flip: viewer.viewport.getFlip()
  };
}

const viewportMatches = (viewer: OpenSeadragon.Viewer, viewport: ImageViewport) => {
  const current = getCurrentViewport(viewer);
  const same = (a: number, b: number) => Math.abs(a - b) < 0.000001;

  return same(current.center.x, viewport.center.x) &&
    same(current.center.y, viewport.center.y) &&
    same(current.zoom, viewport.zoom) &&
    same(current.rotation, viewport.rotation ?? 0) &&
    current.flip === (viewport.flip ?? false);
}

const restoreViewport = (viewer: OpenSeadragon.Viewer, viewport?: ImageViewport) => {
  if (viewport) {
    viewer.viewport.setRotation(viewport.rotation ?? 0, true);
    viewer.viewport.setFlip(viewport.flip ?? false);
    viewer.viewport.zoomTo(viewport.zoom, undefined, true);
    viewer.viewport.panTo(new OpenSeadragon.Point(viewport.center.x, viewport.center.y), true);
  } else {
    viewer.viewport.setRotation(0, true);
    viewer.viewport.setFlip(false);
    viewer.viewport.goHome(true);
  }

  viewer.viewport.applyConstraints();
}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  const { t } = useTranslation('annotate');

  const { image } = props;

  const viewers = useViewers();

  const viewer = viewers.get(image.id);

  const { currentViewports, setCurrentViewport } = useAnnotationViewState();
  const currentViewport = currentViewports[image.id];

  useEffect(() => {
    if (!viewer) return;

    const sync = () => {
      if (!viewer.isOpen()) return;

      if (!currentViewport || !viewportMatches(viewer, currentViewport))
        restoreViewport(viewer, currentViewport);

      props.onViewportRestored?.(viewer.viewport.getFlip());
      setCurrentViewport(image.id, getCurrentViewport(viewer));
    };

    if (viewer.isOpen()) {
      sync();
    } else {
      viewer.addOnceHandler('open', sync);
      return () => viewer.removeHandler('open', sync);
    }
  }, [currentViewport, image.id, props.onViewportRestored, setCurrentViewport, viewer]);

  useEffect(() => {
    if (!viewer) return;

    const saveViewport = () => {
      if (viewer.isOpen())
        setCurrentViewport(image.id, getCurrentViewport(viewer));
    };

    viewer.addHandler('animation-finish', saveViewport);
    viewer.addHandler('rotate', saveViewport);
    viewer.addHandler('flip', saveViewport);

    return () => {
      saveViewport();
      viewer.removeHandler('animation-finish', saveViewport);
      viewer.removeHandler('rotate', saveViewport);
      viewer.removeHandler('flip', saveViewport);
    };
  }, [image.id, setCurrentViewport, viewer]);

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