import { useCallback, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { W3CImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { Combobox, ComboboxOption } from '@/components/Combobox';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { TooltippedButton } from '@/components/TooltippedButton';
import { RelationshipType } from '@/model';
import { useAnnotation, useDataModel, useRelationshipSearch } from '@/store';

interface RelationsListItemProps {

  leftSideId: string; // ID of the annotation to appear on the left

  sourceId: string;

  targetId: string;

  relationship?: string;
  
  onChangeRelationship(type: RelationshipType): void;

  onDelete(): void;

}

export const RelationsListItem = (props: RelationsListItemProps) => {

  const model = useDataModel();

  const { leftSideId, sourceId, targetId, relationship } = props;

  // Can be undefined if the user has meanwhile deleted the 
  // relationship type from the data model!
  const type = useMemo(() => 
    model.getRelationshipType(relationship), [model, relationship]);

  const sourceAnnotation = useAnnotation(sourceId) as W3CImageAnnotation;

  const targetAnnotation = useAnnotation(targetId) as W3CImageAnnotation;

  // Relationship type dropdown
  const [selectedType, setSelectedType] = useState<ComboboxOption>(({ label: relationship, value: relationship }));

  const { applicableTypes } = useRelationshipSearch(sourceAnnotation, targetAnnotation);

  const options = useMemo(() => 
    applicableTypes.map(({ name })=> ({ value: name, label: name })), [applicableTypes]);

  const onChangeRelationship = useCallback((option: ComboboxOption) => {
    setSelectedType(option);

    const next = model.relationshipTypes.find(t => t.name === option.value);
    if (next) 
      props.onChangeRelationship(next);
  }, [model, props.onChangeRelationship]);

  const onDelete = useCallback((evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    props.onDelete();
  }, []);

  return (sourceAnnotation && targetAnnotation) && (
    <div className="flex items-center w-full">
      <div className="flex flex-grow items-center justify-between px-1 py-1.5 text-xs gap-2">
        <AnnotationThumbnail 
          annotation={leftSideId === sourceId ? sourceAnnotation : targetAnnotation} 
          className="border shadow-sm h-12 w-12" /> 

        <div className="relative flex-grow flex items-center">
          <div className="absolute border-t border-gray-600 border-dashed h-[1px] w-full z-0" />
        
          <div className="w-full flex justify-center z-10 font-light text-[11px]">
            <Combobox
              align="center"
              className="h-6 pl-1 rounded-sm pr-0.5 max-w-28"
              size="sm"
              value={selectedType}
              options={options}
              onChange={onChangeRelationship} />
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
          annotation={leftSideId === sourceId ? targetAnnotation : sourceAnnotation} 
          className="border shadow-sm h-12 w-12" />
      </div>

      <ConfirmedDelete
        asChild
        message="This action will delete the relation permanently."
        onConfirm={onDelete}>
        <TooltippedButton 
          variant="ghost" 
          size="icon" 
          type="button"
          className="rounded-full h-8 w-8 hover:text-red-500"
          tooltip="Delete this relationship">
          <Trash2 className="h-4 w-4" />  
        </TooltippedButton>
      </ConfirmedDelete>
    </div>
  )

}