import { useEffect, useState } from 'react';
import { EntityType, LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { W3CImageAnnotation } from '@annotorious/react';
import { Skeleton } from '@/ui/Skeleton';

interface AnnotatedEntitiesProps {

  imageId: string;

  entityType: EntityType;

}

export const AnnotatedEntities = (props: AnnotatedEntitiesProps) => {

  const { imageId, entityType } = props;

  const store = useStore();

  const image = useImages(props.imageId) as LoadedImage;

  const [snippets, setSnippets] = useState<ImageSnippet[]>();

  useEffect(() => {
    if (!image) return;

    setSnippets(undefined);

    // When the image has loaded, get all annotations for this
    // entity type, and clip their snippets
    store.getAnnotations(imageId, { type: 'image' }).then(annotations => {
      const relevant = annotations.filter(a => {
        const bodies = Array.isArray(a.body) ? a.body : [a.body];
        return bodies.some(b => b.source === entityType.id);
      }) as W3CImageAnnotation[];

      if (relevant.length === 0) {
        setSnippets([]);
      } else {
        relevant.map(annotation => getImageSnippet(image, annotation)
          .then(snippet => setSnippets(s => [...(s || []), snippet])));
      }
    });
  }, [image, entityType]);

  return (image && snippets) ? (
    <ul className="flex flex-wrap gap-2">
      {snippets.map(snippet => (
        <li 
          key={snippet.annotation.id}>
          <img
            src={URL.createObjectURL(new Blob([snippet.data]))}
            alt={image.name}
            className="w-20 h-20 object-cover aspect-square rounded-sm border" />
        </li>
      ))}
    </ul>
  ) : (
    <Skeleton className="w-20 h-20 bg-white" /> 
  )

}