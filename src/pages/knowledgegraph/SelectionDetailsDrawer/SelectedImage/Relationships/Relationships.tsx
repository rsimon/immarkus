import { useCallback, useEffect, useMemo, useState } from 'react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { LoadedImage } from '@/model';
import { useStore } from '@/store';
import { W3CImageAnnotation } from '@annotorious/react';
import { RelationshipCard } from './RelationshipCard';

interface RelationshipsProps {

  annotations: W3CImageAnnotation[];

  selectedImage: LoadedImage;

  relationships: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][];

}

export const Relationships = (props: RelationshipsProps) => {

  const { annotations, selectedImage, relationships } = props;

  const store = useStore();

  const [related, setRelated] = useState<{ [image: string]: string[] }>(undefined);

  useEffect(() => {
    store.getRelatedImageAnnotations(selectedImage.id).then(setRelated);
  }, [selectedImage]);

  const getRelationshipsTo = useCallback((imageId: string) => {
    if (!related) return [];

    // All annotations on this image
    const onThisImage = new Set(annotations.map(a => a.id));

    // All annotations on the 'other' image
    const onOtherImage = new Set(related[imageId] || []);
    
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
        <RelationshipCard
          selectedImage={props.selectedImage}
          otherImageId={props.selectedImage.id}
          relationships={intraRelations} />
      )}

      {Object.entries(related).filter(([id, _]) => id !== props.selectedImage.id).map(([otherImageId, _]) => (
        <RelationshipCard 
          key={otherImageId} 
          selectedImage={props.selectedImage}
          otherImageId={otherImageId} 
          relationships={getRelationshipsTo(otherImageId)} />
      ))}
    </div>   
  )

}