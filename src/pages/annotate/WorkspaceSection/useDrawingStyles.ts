import { Vocabulary } from '@/model';
import { useVocabulary } from '@/store';
import { Color, DrawingStyle, ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';

export const colorByEntity = (
  vocabulary: Vocabulary
) => (annotation: ImageAnnotation): DrawingStyle => {

  const firstEntityBody: W3CAnnotationBody = 
    annotation.bodies.find(b => b.purpose === 'classifying');

  if (firstEntityBody) {
    const entity = vocabulary.entities.find(e => e.id === firstEntityBody.source);
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

  const { vocabulary } = useVocabulary();

  return {
    colorByEntity: colorByEntity(vocabulary)
  }

}