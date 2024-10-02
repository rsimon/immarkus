import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { Image, LoadedImage } from '@/model';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store';
import { W3CImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '../../AnnotationThumbnail';

interface RelationshipCardItemProps {

  selectedImage: LoadedImage;

  otherImage: LoadedImage;

  link: W3CRelationLinkAnnotation;
  
  meta: W3CRelationMetaAnnotation;

}

export const RelationshipCardItem = (props: RelationshipCardItemProps) => {

  const store = useStore();

  const [from, setFrom] = useState<{ annotation: W3CImageAnnotation, image: Image }>(); 

  const [to, setTo] = useState<{ annotation: W3CImageAnnotation, image: Image }>(); 

  useEffect(() => {
    store.findAnnotation(props.link.target).then(([annotation, image]) => 
      setFrom({ annotation: annotation as W3CImageAnnotation, image }));

    store.findAnnotation(props.link.body).then(([annotation, image]) => 
      setTo({ annotation: annotation as W3CImageAnnotation, image }));
  }, [store, props.link]);

  const isOutbound = useMemo(() => {
    return from?.image.id === props.selectedImage.id;
  }, [from, to, props.selectedImage]);

  return (from && to) && (isOutbound ? (
    <div className="flex justify-between p-2.5 border-t items-center gap-3 text-xs">
      <AnnotationThumbnail 
        annotation={from.annotation} 
        image={props.selectedImage} />

      <div className="flex-grow h-[1px] border-gray-400 border-t border-dashed relative">
        <div className="absolute -top-[0.675rem] w-full text-center">
          <span className="bg-white px-1 font-light text-muted-foreground">{props.meta.body?.value || ''}</span>
        </div>
        <div className="absolute -right-0.5 -top-[5.5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[12px] border-l-gray-400"></div>
      </div>

      <AnnotationThumbnail 
        annotation={to.annotation} 
        image={props.otherImage} />
    </div>
  ) : (
    <div className="flex justify-between p-2.5 border-t items-center gap-3 text-xs">
      <AnnotationThumbnail
        annotation={to.annotation} 
        image={props.selectedImage} />

      <div className="flex-grow h-[1px] border-gray-400 border-t border-dashed relative">
        <div className="absolute -left-0.5 -top-[5.5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[12px] border-r-gray-400"></div>
        <div className="absolute -top-[0.675rem] w-full text-center">
          <span className="bg-white px-1 font-light text-muted-foreground">{props.meta.body?.value || ''}</span>
        </div>
      </div>

      <AnnotationThumbnail 
        annotation={from.annotation} 
        image={props.otherImage} />
    </div>
  ))

}