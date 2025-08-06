import { ImageAnnotation } from '@annotorious/react';
import { PropertiesForm } from '../../PropertiesForm';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { Separator } from '@/ui/Separator';

interface CompareDialogAnnotationCardProps {

  annotation: ImageAnnotation;

}

export const CompareDialogAnnotationCard = (props: CompareDialogAnnotationCardProps) => {

  return (
    <div className="flex flex-col min-w-84 border rounded-md overflow-y-auto p-3 mx-2">
      <AnnotationThumbnail 
        annotation={props.annotation} />

      <Separator className="mt-3" />

      <PropertiesForm 
        annotation={props.annotation}
        onAddTag={() => {}} />
    </div>
  )
  
}