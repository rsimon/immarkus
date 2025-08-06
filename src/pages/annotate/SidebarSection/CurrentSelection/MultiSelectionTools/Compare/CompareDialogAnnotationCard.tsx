import { ImageAnnotation } from '@annotorious/react';
import { PropertiesForm } from '../../PropertiesForm';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';

interface CompareDialogAnnotationCardProps {

  annotation: ImageAnnotation;

}

export const CompareDialogAnnotationCard = (props: CompareDialogAnnotationCardProps) => {

  return (
    <div className="flex flex-col min-w-84 overflow-y-auto mx-2">
      <AnnotationThumbnail 
        annotation={props.annotation} />

      <div className="p-3 pt-0 flex border rounded-md mt-2 grow">
        <PropertiesForm 
          annotation={props.annotation}
          onAddTag={() => {}} />
      </div>
    </div>
  )
  
}