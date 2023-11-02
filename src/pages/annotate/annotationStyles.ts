import { VocabularyStore } from '@/store/VocabularyStore';
import { Color, DrawingStyle, ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';

export const colorByEntity = (store: VocabularyStore) => (annotation: ImageAnnotation): DrawingStyle => {
  const firstEntityBody: W3CAnnotationBody = annotation.bodies.find(b => b.purpose === 'classifying');

  if (firstEntityBody) {
    const entity = store.entities.find(e => e.id === firstEntityBody.source);
    if (entity)
      return { fill: entity.color as Color };
  }

}