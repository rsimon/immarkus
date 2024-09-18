import OpenSeadragon from 'openseadragon';
import { AnnotoriousOpenSeadragonAnnotator, ImageAnnotation, useAnnotator } from '@annotorious/react';
import { useEffect } from 'react';
import { useRelationEditor } from './RelationEditorRoot';

interface AnnotoriousRelationEditorPluginProps {

  enabled: boolean;

}

export const AnnotoriousRelationEditorPlugin = (props: AnnotoriousRelationEditorPluginProps) => {

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const { setTarget, cancel } = useRelationEditor();

  useEffect(() => {
    if (!anno || !props.enabled) return;

    const { viewer } = anno;

    const { store } = anno.state;

    const onPointerDown = (evt: PointerEvent) => {
      const { offsetX, offsetY } = evt;

      const { x, y } = viewer.viewport.viewerElementToImageCoordinates(new OpenSeadragon.Point(offsetX, offsetY));

      const annotation: ImageAnnotation = (store as any).getAt(x, y);
      if (annotation)
        setTarget(annotation);
      else
        cancel();
    };

    viewer.element.addEventListener('pointerdown', onPointerDown);

    return () => {
      viewer.element.removeEventListener('pointerdown', onPointerDown);
    }
  }, [anno, props.enabled]);

  return null;

}