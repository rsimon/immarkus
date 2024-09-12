import { useEffect, useMemo } from 'react';
import { Spline } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { Skeleton } from '@/ui/Skeleton';
import { Combobox, ComboboxOption } from '@/components/Combobox';
import { useState } from 'react';
import { Button } from '@/ui/Button';

interface RelationEditorContentProps {

  relationshipTypes: string[];
  
  source: ImageAnnotation;

  onSave(source: ImageAnnotation, target: ImageAnnotation, relation: string): void;

  onCancel(): void;

}

export const RelationEditorContent = (props: RelationEditorContentProps) => {

  const { relationshipTypes, source } = props;

  const options = useMemo(() => relationshipTypes.map(t => ({ label: t, value: t })), [relationshipTypes]);
  
  const selection = useSelection();

  const [target, setTarget] = useState<ImageAnnotation | undefined>();

  const [relation, setRelation] = useState<ComboboxOption | undefined>();

  useEffect(() => {
    // When the selection changes, keep it as relation target
    if (selection.selected.length > 0) {
      const { annotation } = selection.selected[0];
      if (annotation.id !== source.id)
        setTarget(annotation as ImageAnnotation);
    } else {
      setTarget(undefined);
    }
  }, [selection, source]);

  const onSave = () => {
    if (target && relation)
      props.onSave(source, target, relation.value);
  }

  return (
    <div>
      <h3 className="flex text-xs text-muted-foreground items-center gap-1 font-medium">
        <Spline className="h-4 w-4" /> Create Relation
      </h3>

      <ol className="list-decimal list-inside">
        <li className="text-xs mt-5 flex-shrink-0">
          Select a target annotation.

          <div className="mt-3 mb-1 ml-4 w-56 flex gap-1 justify-between items-center relative">
            <AnnotationThumbnail 
              annotation={props.source} 
              className="w-12 h-12 border border-gray-300 shadow flex-shrink-0" />

            <div className="overflow-hidden relative py-[5px] flex-grow">
              <div 
                className={`w-full h-0 relative border-gray-300 border-t-2 border-dashed ${target ? '' : 'animate-grow-width'}`}>
                <div className="absolute right-0 -top-[4px] w-[6px] h-[6px] bg-gray-300 rounded-full" />
              </div>
            </div>

            {target ? (
              <AnnotationThumbnail 
                annotation={target} 
                className="w-12 h-12 border border-gray-300 shadow flex-shrink-0" />
            ) : (
              <Skeleton className="border border-gray-300 w-12 h-12 bg-white" />
            )}
          </div>
        </li>

        <li className="text-xs mt-6 mb-1 flex-shrink-0">
          Choose a relation type.

          <div className="ml-4 mt-2">
            <Combobox
              className="w-56"
              value={relation}
              options={options}
              onChange={setRelation} />
          </div>
        </li>
      </ol>

      <Button 
        className="mt-6 w-full"
        disabled={!relation || !target}
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