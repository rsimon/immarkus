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

      <div className="mt-4 mb-3 flex justify-between items-center">
        <AnnotationThumbnail 
          annotation={props.source} 
          className="w-12 h-12 border border-gray-300 shadow" />

        <div className="w-32 border-t-2 border-gray-300 border-dotted" />

        <Skeleton className="border border-gray-300 w-12 h-12 shadow" />
      </div>

      <p className="text-xs px-0.5">
        Select an annotation to pick a target.
      </p>
    </div>
  )

}