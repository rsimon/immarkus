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

      <ol className="list-decimal list-inside">
        <li className="text-xs pt-4 flex-shrink-0">
          Select a target annotation.

          <div className="mt-3 mb-1 ml-4 w-44 flex gap-1 justify-between items-center relative">
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
        </li>

        <li className="text-xs pt-2 flex-shrink-0">
          Choose a connection type.
        </li>
      </ol>
    </div>
  )

}