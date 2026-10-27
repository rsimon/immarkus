import OpenSeadragon from 'openseadragon';
import { useEffect } from 'react';
import { useRelationEditor } from '../RelationEditorRoot';
import { useStore } from '@/store';
import { 
  AnnotoriousOpenSeadragonAnnotator, 
  ImageAnnotation, 
  StoreChangeEvent, 
  useAnnotator, 
  W3CAnnotation 
} from '@annotorious/react';

interface AnnotoriousRelationEditorPluginProps {

  enabled: boolean;

}

export const AnnotoriousRelationEditorPlugin = (props: AnnotoriousRelationEditorPluginProps) => {
  
  const store = useStore();

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator<ImageAnnotation, W3CAnnotation>>();

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

    const onStoreChange = (evt: StoreChangeEvent<ImageAnnotation>) => {
      const { deleted } = evt.changes;
      
      const deletedIds = (deleted || []).map(a => a.id);
      const related = deletedIds.flatMap(id => store.getRelatedAnnotations(id));
      
      const linkIds = related.map(t => t[0].id);
      store.bulkDeleteRelations(linkIds);
    }

    anno.state.store.observe(onStoreChange);

    return () => {
      anno?.state?.store?.unobserve(onStoreChange);
    }
  }, [anno, store]);

  return null;

}