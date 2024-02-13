import { ImageAnnotation, AnnotoriousOpenSeadragonAnnotator } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';
import { useAnnotations, useAnnotoriousManifold } from '@annotorious/react-manifold';
import { useStore } from '@/store';

export const AnnotationList = () => {

  const manifold = useAnnotoriousManifold();

  const annotations = useAnnotations<ImageAnnotation>();

  const store = useStore();

  const onSelect = (annotation: ImageAnnotation) => () => {
    console.log('select', annotation);

    manifold.setSelected(annotation.id);

    const annotator = manifold.findAnnotator(annotation.id);
    (annotator as AnnotoriousOpenSeadragonAnnotator).fitBounds(annotation, { padding: 200});
  }

  const onDelete = (annotation: ImageAnnotation) => () =>
    manifold.deleteAnnotation(annotation.id);

  const imageIds = Array.from(annotations.keys());

  return imageIds.length === 1 ? (
    <div className="py-2 grow">
      <ul>
        {annotations.get(imageIds[0]).map(annotation => (
          <li key={annotation.id} onClick={onSelect(annotation)}>
            <AnnotationListItem 
              annotation={annotation} 
              onSelect={onSelect(annotation)}
              onDelete={onDelete(annotation)} />
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div className="py-2 grow">
      <ul>
        {Array.from(annotations.keys()).map(source => (
          <li key={source}>
            <h2 className="text-xs font-medium mb-2">
              {store.getImage(source).name}
            </h2>

            <ul>
              {annotations.get(source).map(annotation => (
                <li key={annotation.id} onClick={onSelect(annotation)}>
                  <AnnotationListItem 
                    annotation={annotation} 
                    onSelect={onSelect(annotation)}
                    onDelete={onDelete(annotation)} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>  
  )

}