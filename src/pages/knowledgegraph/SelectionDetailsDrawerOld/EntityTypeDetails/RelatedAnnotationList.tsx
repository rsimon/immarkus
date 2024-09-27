import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Image } from 'lucide-react';
import { W3CImageAnnotation } from '@annotorious/react';
import { useImageSnippets, useStore } from '@/store';
import { ImageSnippet } from '@/utils/getImageSnippet';
import { EntityBadge } from '@/components/EntityBadge';

interface ThumbnailProps {

  // related: RelatedAnnotation;

  snippets?: ImageSnippet[];

}

const Thumbnail = (props: ThumbnailProps) => {

  // const { annotation, image } = props.related;

  /*
  const snippet = useMemo(() => (
    props.snippets && props.snippets.find(s => s.annotation.id === annotation.id)
  ), [annotation, props.snippets]);

  return snippet && (
    <img
      src={URL.createObjectURL(new Blob([snippet.data]))}
      alt={image.name}
      className="w-20 h-20 object-cover aspect-square rounded-sm border" />
  )*/

  return null;

}

interface RelatedAnnotationList {

  // related: RelatedAnnotation[];

}

export const RelatedAnnotationList = (props: RelatedAnnotationList) => {

  const store = useStore();

  const model = store.getDataModel();

  /* Grouped by images
  const grouped: [string, RelatedAnnotation[]][] = useMemo(() => {
    return Object.entries(props.related.reduce((grouped, annotation) => {
      (grouped[annotation.image.id] = grouped[annotation.image.id] || []).push(annotation);
      return grouped;
    }, {}));
  }, [props.related]);

  
  const annotations = useMemo(() => 
    props.related.map(r => r.annotation as W3CImageAnnotation), [props.related]);

  const snippets = useImageSnippets(annotations);

  return grouped.map(([imageId, annotations]) => (
    <section 
      key={imageId} 
      className="p-4 border-t">
      <h3 className="text-xs mb-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
        {store.getImage(imageId).name}
      </h3>

      <ul>
        {annotations.map(r => (
          <li 
            key={r.annotation.id}
            className="flex items-end gap-2 text-sm mb-2">
              
            <Thumbnail related={r} snippets={snippets} />
            
            <div className="pb-1 flex flex-col gap-0.5 text-xs overflow-hidden">
              <div>
                <EntityBadge entityType={model.getEntityType(r.sourceEntityType)} />
              </div>

              <div>
                {r.relationName}:{r.targetInstance}
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <Image className="w-3.5 h-3.5" />

                <Link 
                  to={`../annotate/${r.image.id}`}
                  className="whitespace-nowrap block max-w-full overflow-hidden text-ellipsis italic text-sky-700 hover:underline">
                  {r.image.name}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  ));

    */

  return null;

}