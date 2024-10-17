import OpenSeadragon from 'openseadragon';
import { AnnotoriousOpenSeadragonAnnotator, ImageAnnotation, useAnnotator } from '@annotorious/react';
import { useEffect } from 'react';
import { useRelationEditor } from '../RelationEditorRoot';
import { useStore } from '@/store';
import { useHover } from './useHover';
import { isConnectedTo } from './useRelationEmphasisStyle';

import './AnnotoriousRelationEditorPlugin.css';

interface AnnotoriousRelationEditorPluginProps {

  enabled: boolean;

}

export const AnnotoriousRelationEditorPlugin = (props: AnnotoriousRelationEditorPluginProps) => {
  
  const store = useStore();

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const hover = useHover();

  const { source, setTarget, cancel } = useRelationEditor();

  useEffect(() => {
    if (!anno || !props.enabled) return;

    const { viewer } = anno;

    const onPointerDown = (evt: PointerEvent) => {
      const { offsetX, offsetY } = evt;

      const { x, y } = viewer.viewport.viewerElementToImageCoordinates(new OpenSeadragon.Point(offsetX, offsetY));

      const annotation: ImageAnnotation = (anno.state.store as any).getAt(x, y);
      if (annotation) {
        const isValidTarget = annotation.id !== source.id && !isConnectedTo(source.id, store).has(annotation.id);   
        if (isValidTarget)
          setTarget(annotation);
      } else {
        cancel();
      }
    };

    viewer.element.addEventListener('pointerdown', onPointerDown);

    return () => {
      viewer.element?.removeEventListener('pointerdown', onPointerDown);
    }
  }, [anno, props.enabled]);

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

  useEffect(() => {
    if (!props.enabled || !source) return;

    const canvas = anno.viewer.element.querySelector('.a9s-gl-canvas');

    if (hover) {
      const isValidTarget = hover.id !== source.id && !isConnectedTo(source.id, store).has(hover.id);      
      if (isValidTarget)
        canvas.classList.remove('not-allowed');
      else 
        canvas.classList.add('not-allowed');
    } else {
      canvas.classList.remove('not-allowed');
    }
  }, [props.enabled, source, hover, store]);

  return null;

}