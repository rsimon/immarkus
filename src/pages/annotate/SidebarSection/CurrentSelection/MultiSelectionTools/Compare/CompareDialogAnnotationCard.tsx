import { ImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { PropertiesForm } from '../../PropertiesForm';

interface CompareDialogAnnotationCardProps {

  annotation: ImageAnnotation;

  onAddTag(): void;

}

export const CompareDialogAnnotationCard = (props: CompareDialogAnnotationCardProps) => {

  return (
    <div className="flex flex-col shrink-0 basis-80 mx-2">
      <AnnotationThumbnail 
        annotation={props.annotation} />

      <div className="flex flex-col border rounded-md mt-3 px-3 grow overflow-y-auto overflow-x-hidden">
        <PropertiesForm 
            annotation={props.annotation}
            onAddTag={props.onAddTag} />

        <div className="shrink-0"><div className="w-2 h-3"/></div>
      </div>
    </div>
  )
  
}