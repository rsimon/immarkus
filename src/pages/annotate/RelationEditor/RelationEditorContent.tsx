import { useEffect, useState } from 'react';
import { Spline } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Skeleton';
import { RelationshipBrowserPopover } from './RelationshipBrowser';
import { RelationshipType } from '@/model';

interface RelationEditorContentProps {
  
  source: ImageAnnotation;

  target?: ImageAnnotation;

  onSave(source: ImageAnnotation, target: ImageAnnotation, relation: string): void;

  onCancel(): void;

}

export const RelationEditorContent = (props: RelationEditorContentProps) => {

  const { source, target } = props;
  
  const [relation, setRelation] = useState<RelationshipType | undefined>();

  useEffect(() => {
    // Reset the relation when the target changes (may no longer fit restrictions!)
    setRelation(undefined);
  }, [target?.id]);

  const onSave = () => {
    if (props.target && relation)
      props.onSave(source, props.target, relation.name);
  }

  return (
    <div>
      <h3 className="flex text-xs text-muted-foreground items-center gap-1 font-medium">
        <Spline className="h-4 w-4" /> Create Relation
      </h3>

      <ol className="list-decimal list-inside">
        <li className="text-xs mt-5 shrink-0">
          Select a target annotation.

          <div className="mt-3 mb-1 ml-4 w-56 flex gap-1 justify-between items-center relative">
            <AnnotationThumbnail 
              annotation={props.source} 
              className="w-12 h-12 border-fuchsia-600 border-2 shadow-sm shrink-0" />

            <div className="overflow-hidden relative py-[5px] grow">
              <div 
                className={`w-full h-0 relative border-green-500 border-t-2 border-dashed ${props.target ? '' : 'animate-grow-width'}`}>
                <div className="absolute right-0 -top-[4px] w-[6px] h-[6px] bg-green-500 rounded-full" />
              </div>
            </div>

            {props.target ? (
              <AnnotationThumbnail 
                annotation={props.target} 
                className="w-12 h-12 border-2 border-green-500 shadow-sm shrink-0" />
            ) : (
              <Skeleton className="border border-gray-300 w-12 h-12 bg-white" />
            )}
          </div>
        </li>

        <li className="text-xs mt-6 mb-1 shrink-0">
          Choose a relation type.

          <div className="ml-4 mt-2">
            <RelationshipBrowserPopover 
              source={source} 
              target={target} 
              relation={relation}
              onChange={setRelation} />
          </div>
        </li>
      </ol>

      <Button 
        className="mt-6 w-full"
        disabled={!relation || !props.target}
        onClick={onSave}>Save</Button>

      <Button
        variant="outline"
        className="mt-2 w-full"
        onClick={props.onCancel}>
        Cancel
      </Button>
    </div>
  )

}