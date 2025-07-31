import { useCallback, useEffect, useMemo, useState } from 'react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import { LoadedImage } from '@/model';
import { useStore } from '@/store';
import { W3CImageAnnotation } from '@annotorious/react';
import { ImageRelationshipCard } from './ImageRelationshipCard';

interface ImageRelationshipsProps {

  annotations: W3CImageAnnotation[];

  selectedImage: LoadedImage;

  relationships: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][];

}

export const ImageRelationships = (props: ImageRelationshipsProps) => {

  const { annotations, selectedImage, relationships } = props;

  const store = useStore();

  const [related, setRelated] = useState<{ [image: string]: string[] }>(undefined);

  useEffect(() => {
    store.getRelatedImageAnnotations(selectedImage.id).then(setRelated);
  }, [selectedImage]);

  const getRelationshipsTo = useCallback((otherId: string) => {
    if (!related) return [];

    // All annotations on this image
    const onThisImage = new Set(annotations.map(a => a.id));

    // All annotations on the 'other' image
    // const otherId = 'canvas' in source ? `iiif:${source.manifestId}:${source.id}` : source.id;
    const onOtherImage = new Set(related[otherId] || []);
    
    // Return only relations that point from this image to the other
    // (or vice versa).
    return relationships.filter(([link, _]) => {
      const { body, target } = link;
    
      return (onThisImage.has(body) && onOtherImage.has(target)) || 
        (onThisImage.has(target) && onOtherImage.has(body));
    });
  }, [annotations, relationships, related]);

  const intraRelations = useMemo(() => 
    getRelationshipsTo(props.selectedImage.id), [related, props.selectedImage]);

  return related && (
    <div className="space-y-2">
      {intraRelations.length > 0 && (
        <ImageRelationshipCard
          selectedImage={props.selectedImage}
          otherImageId={props.selectedImage.id}
          relationships={intraRelations} />
      )}

      {Object.entries(related).filter(([id, _]) => id !== props.selectedImage.id).map(([otherImageId, _]) => (
        <ImageRelationshipCard 
          key={otherImageId} 
          selectedImage={props.selectedImage}
          otherImageId={otherImageId} 
          relationships={getRelationshipsTo(otherImageId)} />
      ))}
    </div>   
  )

}