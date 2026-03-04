import chroma from 'chroma-js';
import { DataModel, useDataModel } from '@/store';
import type { 
  AnnotationState, 
  Color, 
  DrawingStyle, 
  ImageAnnotation, 
  W3CAnnotationBody 
} from '@annotorious/react';

export const colorByEntityType = (
  model: DataModel
) => (annotation: ImageAnnotation, state: AnnotationState): DrawingStyle => {

  const strokeWidth = state?.selected ? 3 : 1.2;

  const firstEntityBody =
    annotation.bodies.find(b => b.purpose === 'classifying') as unknown as W3CAnnotationBody;

  if (firstEntityBody) {
    const entityType = model.entityTypes.find(e => e.id === firstEntityBody.source);

    return entityType ? { 
      fill: entityType.color as Color,
      stroke: chroma(entityType.color).darken(2).hex() as Color,
      strokeOpacity: 1,
      strokeWidth
    } : {
      fill: '#000000',
      stroke: '#000000',
      strokeOpacity: 1,
      strokeWidth
    };
  } else {
    return {
      fill: '#000000',
      stroke: '#000000',
      strokeOpacity: 1,
      strokeWidth
    }
  }

}

export const useDrawingStyles = () => {

  const model = useDataModel();

  return {
    colorByEntity: colorByEntityType(model)
  }

}