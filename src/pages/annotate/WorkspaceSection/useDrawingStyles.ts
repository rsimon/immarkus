import { DataModel, useDataModel } from '@/store';
import { Color, DrawingStyle, ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';

export const colorByEntityType = (
  model: DataModel
) => (annotation: ImageAnnotation): DrawingStyle => {

  const firstEntityBody: W3CAnnotationBody =
    annotation.bodies.find(b => b.purpose === 'classifying');

  if (firstEntityBody) {
    const entityType = model.entityTypes.find(e => e.id === firstEntityBody.source);
    return entityType ? { 
      fill: entityType.color as Color,
      stroke: entityType.color as Color,
      strokeOpacity: 1,
      strokeWidth: 1
    } : {
      fill: '#000000',
      stroke: '#000000',
      strokeOpacity: 1,
      strokeWidth: 1
    };
  } else {
    return {
      fill: '#000000',
      stroke: '#000000',
      strokeOpacity: 1,
      strokeWidth: 1
    }
  }

}

export const useDrawingStyles = () => {

  const { model } = useDataModel();

  return {
    colorByEntity: colorByEntityType(model)
  }

}