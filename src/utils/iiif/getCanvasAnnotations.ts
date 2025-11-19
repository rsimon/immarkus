import { Annotation, AnnotationPage } from 'cozy-iiif';

const isCanvasAnnotation = (annotation: Annotation) => {
  const target = Array.isArray(annotation.target) ? 
    annotation.target[0] : annotation.target;

  if (!target) return false;

  if (typeof target === 'string') {
    return !target.includes('#');
  } else {
    if ('selector' in target) return false;

    if ('source' in target && typeof target.source === 'string') {
      return !target.source.includes('#')
    }

    console.warn('Unexpected annotation target', target);
    return false;
  }
}

export const getCanvasAnnotations = (pages: AnnotationPage[]): Annotation[] =>
  pages.reduce<Annotation[]>((all, page) => {
    const annotations = (page.items || []).filter(isCanvasAnnotation);
    return [...all, ...annotations];
  }, []);