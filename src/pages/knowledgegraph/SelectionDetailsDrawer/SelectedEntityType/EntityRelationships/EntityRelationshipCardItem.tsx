import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { W3CImageAnnotation } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { EntityType } from '@/model';
import { useImageSnippets, useStore } from '@/store';
import { GraphLinkPrimitive } from '../../../Types';
import { RelationshipThumbnail } from '../../RelationshipThumbnail';

interface EntityRelationshipCardItemProps {

  selectedType: EntityType;

  relatedType: EntityType;

  relationship: GraphLinkPrimitive;

}

export const LazyLoadingEntityRelationshipCardItem = (props: EntityRelationshipCardItemProps) => {

  const { selectedType, relationship } = props;

  const { data } = relationship;

  const store = useStore();

  const [link, meta] = useMemo(() => {
    if (!data || !Array.isArray(data)) return [undefined, undefined];

    const link: W3CRelationLinkAnnotation = data[0];
    const meta: W3CRelationMetaAnnotation | undefined = data.length > 1 ? data[1] : undefined;

    return [link, meta];
  }, [data]);

  const directed = useMemo(() => {
    if (!meta?.body?.value) return false;

    const relationshipType = store.getDataModel().getRelationshipType(meta.body.value);
    return relationshipType?.directed;
  }, [meta]);

  const [fromAnnotation, setFromAnnotation] = useState<W3CImageAnnotation |  undefined>();
  const [toAnnotation, setToAnnotation] = useState<W3CImageAnnotation |  undefined>();

  const snippets = useImageSnippets(
    (fromAnnotation && toAnnotation) ? [fromAnnotation, toAnnotation] : undefined
  );

  const isOutbound = useMemo(() => {
    return relationship.source === selectedType.id;
  }, [relationship, selectedType]);

  useEffect(() => {
    if (!link) return;

    Promise.all([
      store.findAnnotation(link.target),
      store.findAnnotation(link.body)
    ]).then(([from, to]) => {
      setFromAnnotation(from[0] as W3CImageAnnotation);
      setToAnnotation(to[0] as W3CImageAnnotation);
    });
  }, [link, store]);

  return snippets && (
    <RelationshipThumbnail 
      directed={directed}
      fromSnippet={snippets[0]}
      toSnippet={snippets[1]}
      outbound={isOutbound}
      label={meta?.body?.value} />
  )

}

export const EntityRelationshipCardItem = (props: EntityRelationshipCardItemProps) => {

  const { ref, inView } = useInView();

  return (
    <div ref={ref}>
      {inView ? (
        <LazyLoadingEntityRelationshipCardItem {...props} />
      ) : null}
    </div>
  )

}