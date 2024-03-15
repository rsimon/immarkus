import { useEffect, useState } from 'react';
import { EntityType, LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { W3CImageAnnotation } from '@annotorious/react';

interface AnnotatedEntitiesProps {

  imageId: string;

  entityType: EntityType;

}

export const AnnotatedEntities = (props: AnnotatedEntitiesProps) => {

  const { imageId, entityType } = props;

  const store = useStore();

  const image = useImages(props.imageId) as LoadedImage;

  const [snippets, setSnippets] = useState<ImageSnippet[]>([]);

  useEffect(() => {
    if (!image) return;

    // When the image has loaded, get all annotations for this
    // entity type, and clip their snippets
    store.getAnnotations(imageId, { type: 'image' }).then(annotations => {
      const relevant = annotations.filter(a => {
        const bodies = Array.isArray(a.body) ? a.body : [a.body];
        return bodies.some(b => b.source === entityType.id);
      }) as W3CImageAnnotation[];

      relevant.map(annotation => getImageSnippet(image, annotation)
        .then(snippet => setSnippets(s => [...s, snippet])));
    });
  }, [image]);

  console.log(snippets);

  return image && snippets && (
    <div>
      {snippets.map(snippet => (
        <img
          key={snippet.annotation.id}
          src={URL.createObjectURL(new Blob([snippet.data]))}
          alt={image.name}
          className="w-14 h-14 object-cover aspect-square rounded-sm shadow border border-black/20" />
      ))}
    </div>
  )

}