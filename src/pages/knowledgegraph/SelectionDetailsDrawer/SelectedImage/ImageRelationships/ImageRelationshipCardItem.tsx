import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { Image, LoadedImage } from '@/model';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store';
import { W3CImageAnnotation } from '@annotorious/react';
import { RelationshipThumbnail } from '../../RelationshipThumbnail';

interface ImageRelationshipCardItemProps {

  selectedImage: LoadedImage;

  otherImage: LoadedImage;

  link: W3CRelationLinkAnnotation;
  
  meta: W3CRelationMetaAnnotation;

}

export const ImageRelationshipCardItem = (props: ImageRelationshipCardItemProps) => {

  const store = useStore();

  const [from, setFrom] = useState<{ annotation: W3CImageAnnotation, image: Image }>(); 

  const [to, setTo] = useState<{ annotation: W3CImageAnnotation, image: Image }>(); 

  const directed = useMemo(() => {
    if (!props.meta?.body?.value) return false;

    const relationshipType = store.getDataModel().getRelationshipType(props.meta.body.value);
    return relationshipType?.directed;
  }, [props.meta]);

  useEffect(() => {
    store.findAnnotation(props.link.target).then(([annotation, image]) => 
      setFrom({ annotation: annotation as W3CImageAnnotation, image }));

    store.findAnnotation(props.link.body).then(([annotation, image]) => 
      setTo({ annotation: annotation as W3CImageAnnotation, image }));
  }, [store, props.link]);

  const isOutbound = useMemo(() => {
    return from?.image.id === props.selectedImage.id;
  }, [from, to, props.selectedImage]);

  return (from && to) && (
    <RelationshipThumbnail 
      directed={directed}
      fromAnnotation={from.annotation}
      fromImage={isOutbound ? props.selectedImage : props.otherImage}
      toAnnotation={to.annotation}
      toImage={isOutbound ? props.otherImage : props.selectedImage} 
      label={props.meta?.body?.value} 
      outbound={isOutbound} />
  )

}