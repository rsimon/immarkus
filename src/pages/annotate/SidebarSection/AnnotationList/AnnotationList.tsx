import { ImageAnnotation } from '@annotorious/react';
import { AnnotationListItem } from './AnnotationListItem';
import { useAnnotations, useAnnotoriousManifold } from '@annotorious/react-manifold';
import { useStore } from '@/store';

export const AnnotationList = () => {

  const anno = useAnnotoriousManifold();

  const annotations = useAnnotations<ImageAnnotation>();

  const store = useStore();

  const onSelect = (annotation: ImageAnnotation) => () => {
    // TODO
    // anno.setSelected(annotation.id);
  }

  const onDelete = (annotation: ImageAnnotation) => () =>
    anno.deleteAnnotation(annotation.id);

  return (
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