import { Spline } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { Skeleton } from '@/ui/Skeleton';

interface RelationEditorHintProps {
  
  source: ImageAnnotation;

}

export const RelationEditorHint = (props: RelationEditorHintProps) => {

  return (
    <div>
      <h3 className="flex text-xs text-muted-foreground items-center gap-1">
        <Spline className="h-4 w-4" /> Create Connection
      </h3>

      <p className="text-xs pt-1.5 flex-shrink-0">
        Select an annotation to pick a target.
      </p>

      <div className="mt-4 mb-1 mx-auto w-44 flex gap-1 justify-between items-center relative">
        <AnnotationThumbnail 
          annotation={props.source} 
          className="w-12 h-12 border border-gray-300 shadow flex-shrink-0" />

        <div className="overflow-hidden relative py-[5px] flex-grow">
          <div className="w-full border-gray-300 border-t-2 border-dashed animate-grow-width">
            <div className="absolute right-0 -top-[4px] w-[6px] h-[6px] bg-gray-300 rounded-full" />
          </div>
        </div>

        <Skeleton className="border border-gray-300 w-12 h-12" />
      </div>
    </div>
  )

}