import { useEffect, useMemo, useState } from 'react';
import { W3CImageAnnotation } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { CanvasInformation, FileImage, LoadedImage } from '@/model';
import { useImageSnippets, useStore } from '@/store';
import { RelationshipThumbnail } from '../../RelationshipThumbnail';

interface ImageRelationshipCardItemProps {

  selectedImage: LoadedImage;

  otherImage: LoadedImage;

  link: W3CRelationLinkAnnotation;
  
  meta: W3CRelationMetaAnnotation;

}

export const ImageRelationshipCardItem = (props: ImageRelationshipCardItemProps) => {

  const store = useStore();

  const [fromAnnotation, setFromAnnotation] = useState<W3CImageAnnotation |  undefined>();
  const [fromImage, setFromImage] = useState<FileImage | CanvasInformation | undefined>();
  const [toAnnotation, setToAnnotation] = useState<W3CImageAnnotation |  undefined>();

  const snippets = useImageSnippets(
    (fromAnnotation && toAnnotation) ? [fromAnnotation, toAnnotation] : undefined
  );

  const directed = useMemo(() => {
    if (!props.meta?.body?.value) return false;

    const relationshipType = store.getDataModel().getRelationshipType(props.meta.body.value);
    return relationshipType?.directed;
  }, [props.meta]);

  useEffect(() => {
    store.findAnnotation(props.link.target).then(([annotation, image]) => {
      setFromAnnotation(annotation as W3CImageAnnotation);
      setFromImage(image);
    });

    store.findAnnotation(props.link.body).then(([annotation, _]) => 
      setToAnnotation(annotation as W3CImageAnnotation));
  }, [store, props.link]);

  const isOutbound = useMemo(() => {
    if (!fromImage) return;

    const fromId = 'uri' in fromImage ? `iiif:${fromImage.manifestId}:${fromImage.id}` : fromImage.id;
    return fromId === props.selectedImage.id;
  }, [fromImage, props.selectedImage]);

  return snippets && (
    <RelationshipThumbnail 
      directed={directed}
      fromSnippet={snippets[0]}
      toSnippet={snippets[1]}
      label={props.meta?.body?.value} 
      outbound={isOutbound} />
  )

}