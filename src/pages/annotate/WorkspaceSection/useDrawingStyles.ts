import { Vocabulary } from '@/model';
import { useStore, useVocabulary } from '@/store';
import { VocabularyStore } from '@/store/VocabularyStore';
import { Color, DrawingStyle, ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';

export const colorByEntity = (
  vocabulary: Vocabulary
) => (annotation: ImageAnnotation): DrawingStyle => {

  const firstEntityBody: W3CAnnotationBody = 
    annotation.bodies.find(b => b.purpose === 'classifying');

  if (firstEntityBody) {
    const entity = vocabulary.entities.find(e => e.id === firstEntityBody.source);
    if (entity)
      return { 
        fill: entity.color as Color,
        stroke: entity.color as Color
      };
  }

}

export const useDrawingStyles = () => {

  const { vocabulary } = useVocabulary();

  return {
    colorByEntity: colorByEntity(vocabulary)
  }

}