import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { EntityType, LoadedImage } from '@/model';
import { useStore } from '@/store';
import { GraphLinkPrimitive } from '../../../Types';
import { W3CImageAnnotation } from '@annotorious/react';
import { RelationshipThumbnail } from '../../RelationshipThumbnail';

interface EntityRelationshipCardItemProps {

  selectedType: EntityType;

  relatedType: EntityType;

  relationship: GraphLinkPrimitive;

}

export const EntityRelationshipCardItem = (props: EntityRelationshipCardItemProps) => {

  const { selectedType, relatedType, relationship } = props;

  const { data } = relationship;

  const { ref, inView } = useInView();

  const store = useStore();

  const [link, meta] = useMemo(() => {
    if (!data || !Array.isArray(data)) return [undefined, undefined];

    const link: W3CRelationLinkAnnotation = data[0];
    const meta: W3CRelationMetaAnnotation | undefined = data.length > 1 ? data[1] : undefined;

    return [link, meta];
  }, [data]);

  const [fromAnnotation, setFromAnnotation] = useState<W3CImageAnnotation |  undefined>();

  const [fromImage, setFromImage] = useState<LoadedImage |  undefined>();

  const [toAnnotation, setToAnnotation] = useState<W3CImageAnnotation |  undefined>();

  const [toImage, setToImage] = useState<LoadedImage |  undefined>();

  const isOutbound = useMemo(() => {
    return relationship.source === selectedType.id;
  }, [relationship, selectedType]);

  useEffect(() => {
    if (!inView || !link) return;

    Promise.all([
      store.findAnnotation(link.target),
      store.findAnnotation(link.body)
    ]).then(([from, to]) => {
      const [fromAnnotation, fromImage] = from;
      const [toAnnotation, toImage] = to;

      setFromAnnotation(fromAnnotation as W3CImageAnnotation);
      setToAnnotation(toAnnotation as W3CImageAnnotation);

      if (fromImage.id === toImage.id) {
        // Both annotations on same image
        store.loadImage(fromImage.id).then(loaded => {
          setFromImage(loaded);
          setToImage(loaded);
        });
      } else {
        // Annotations on different images
        store.loadImage(fromImage.id).then(setFromImage);
        store.loadImage(toImage.id).then(setToImage);
      }
    });
  }, [inView, link, store]);

  return (
    <div ref={ref}>
      {(fromImage && toImage) && (
        <RelationshipThumbnail 
          fromAnnotation={fromAnnotation}
          fromImage={fromImage}
          toAnnotation={toAnnotation}
          toImage={toImage}
          outbound={isOutbound}
          label={meta?.body?.value} />
      )}
    </div>
  )

}