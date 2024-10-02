import { W3CImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from './AnnotationThumbnail';
import { LoadedImage } from '@/model';

interface RelationshipThumbnailProps {

  fromAnnotation: W3CImageAnnotation;

  fromImage: LoadedImage;

  toAnnotation: W3CImageAnnotation;

  toImage: LoadedImage;

  label?: string

  outbound: boolean;

}

export const RelationshipThumbnail = (props: RelationshipThumbnailProps) => {

  return props.outbound ? (
    <div className="flex justify-between p-2.5 border-t items-center gap-3 text-xs">
      <AnnotationThumbnail 
        annotation={props.fromAnnotation} 
        image={props.fromImage} />

      <div className="flex-grow h-[1px] border-gray-400 border-t border-dashed relative">
        <div className="absolute -top-[0.675rem] w-full text-center">
          <span className="bg-white px-1 font-light text-muted-foreground">{props.label || ''}</span>
        </div>
        <div className="absolute -right-0.5 -top-[5.5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[12px] border-l-gray-400"></div>
      </div>

      <AnnotationThumbnail 
        annotation={props.toAnnotation} 
        image={props.toImage} />
    </div>
  ) : (
    <div className="flex justify-between p-2.5 border-t items-center gap-3 text-xs">
      <AnnotationThumbnail
        annotation={props.toAnnotation} 
        image={props.toImage} />

      <div className="flex-grow h-[1px] border-gray-400 border-t border-dashed relative">
        <div className="absolute -left-0.5 -top-[5.5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[12px] border-r-gray-400"></div>
        <div className="absolute -top-[0.675rem] w-full text-center">
          <span className="bg-white px-1 font-light text-muted-foreground">{props.label || ''}</span>
        </div>
      </div>

      <AnnotationThumbnail 
        annotation={props.fromAnnotation} 
        image={props.fromImage} />
    </div>
  )

}