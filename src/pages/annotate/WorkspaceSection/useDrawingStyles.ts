import type { DataModel } from '@/model';
import { useDataModel } from '@/store';
import { Color, DrawingStyle, ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';

export const colorByEntity = (
  model: DataModel
) => (annotation: ImageAnnotation): DrawingStyle => {

  const firstEntityBody: W3CAnnotationBody = 
    annotation.bodies.find(b => b.purpose === 'classifying');

  if (firstEntityBody) {
    const entity = model.entityTypes.find(e => e.id === firstEntityBody.source);
    return entity ? { 
      fill: entity.color as Color
    } : {
      fill: '#000000'
    };
  } else {
    return {
      fill: '#000000'
    }
  }

}

export const useDrawingStyles = () => {

  const { model } = useDataModel();

  return {
    colorByEntity: colorByEntity(model)
  }

}