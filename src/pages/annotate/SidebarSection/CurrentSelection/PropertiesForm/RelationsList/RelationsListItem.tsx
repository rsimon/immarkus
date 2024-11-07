import { useCallback, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { Button } from '@/ui/Button';
import { useDataModel } from '@/store';
import { Combobox, ComboboxOption } from '@/components/Combobox';

interface RelationsListItemProps {

  leftSideId: string; // ID of the annotation to appear on the left

  sourceId: string;

  targetId: string;

  relationship?: string;

  onDelete(): void;

}

export const RelationsListItem = (props: RelationsListItemProps) => {

  const model = useDataModel();

  const { leftSideId, sourceId, targetId, relationship } = props;

  // const options: ComboboxOption[] = model.relationshipTypes.map(r => ({ label: r.name, value: r.name }))

  // Can be undefined if the user has meanwhile deleted the 
  // relationship type from the data model!
  const type = useMemo(() => 
    model.getRelationshipType(relationship), [model, relationship]);

  const onDelete = useCallback((evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    props.onDelete();
  }, []);

  return (
    <div className="flex items-center w-full">
      <div className="flex flex-grow items-center justify-between px-1 py-1.5 text-xs gap-2">
        <AnnotationThumbnail 
          annotation={leftSideId === sourceId ? sourceId : targetId} 
          className="border shadow-sm h-12 w-12" /> 

        <div className="relative flex-grow flex items-center">
          <div className="absolute border-t border-gray-600 border-dashed h-[1px] w-full z-0" />
        
          <div className="w-full flex justify-center z-10 font-light text-[11px]">
            <Combobox
              align="center"
              className="h-6 pl-1 rounded-sm pr-0.5 max-w-32"
              value={{ label: relationship!, value: relationship }}
              options={[]}
              size="sm"
              onChange={() => {}}/>
          </div>

          {type?.directed && (
            leftSideId === sourceId ? (
              <div className="absolute -right-0.5 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[10px] border-l-gray-600" />
            ) : (
              <div className="absolute -left-0.5 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[10px] border-r-gray-600" />
            )
          )}
        </div>

        <AnnotationThumbnail 
          annotation={leftSideId === sourceId ? targetId : sourceId} 
          className="border shadow-sm h-12 w-12" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

}