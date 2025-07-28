import OpenSeadragon from 'openseadragon';
import { AnnotoriousOpenSeadragonAnnotator, ImageAnnotation, useAnnotator } from '@annotorious/react';
import { useEffect } from 'react';
import { useRelationEditor } from '../RelationEditorRoot';
import { useStore } from '@/store';

interface AnnotoriousRelationEditorPluginProps {

  enabled: boolean;

}

export const AnnotoriousRelationEditorPlugin = (props: AnnotoriousRelationEditorPluginProps) => {
  
  const store = useStore();

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const { source, setTarget, cancel } = useRelationEditor();

  useEffect(() => {
    if (!anno || !props.enabled) return;

    const { viewer } = anno;

    const { store } = anno.state;

    const onPointerDown = (evt: PointerEvent) => {
      const { offsetX, offsetY } = evt;

      const { x, y } = viewer.viewport.viewerElementToImageCoordinates(new OpenSeadragon.Point(offsetX, offsetY));

      const annotation: ImageAnnotation = (store as any).getAt(x, y);
      if (annotation) {
        if (annotation.id !== source?.id)
          setTarget(annotation);
      } else {
        cancel();
      }
    };

    viewer.element.addEventListener('pointerdown', onPointerDown);

    return () => {
      viewer.element?.removeEventListener('pointerdown', onPointerDown);
    }
  }, [anno, props.enabled, source]);

  useEffect(() => {
    if (!anno || !store) return;

    const onDelete = (annotation: ImageAnnotation) => {
      const related = store.getRelatedAnnotations(annotation.id);
      related.forEach(([link, _]) => store.deleteRelation(link.id));
    }

    anno.on('deleteAnnotation', onDelete);

    return () => {
      anno.off('deleteAnnotation', onDelete);
    }
  }, [anno, store]);

  return null;

}