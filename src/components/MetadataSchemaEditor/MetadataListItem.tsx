import { PropertyDefinition } from '@/model';
import { PropertyDefinitionActions } from '@/components/PropertyDefinitionEditor';
import { PropertyTypeIcon } from '@/components/PropertyTypeIcon';

interface MetadataListItemProps {

  editorHint: string;

  previewHint: string;

  definition: PropertyDefinition;

  onMoveUp(): void;

  onMoveDown(): void;

  onUpdateProperty(updated: PropertyDefinition): void;

  onDeleteProperty(): void;

}

export const MetadataListItem = (props: MetadataListItemProps) => {

  return (
    <div className="border w-full bg-white mt-2 rounded-sm px-3 py-2 text-sm shadow-sm flex justify-between items-center">
      <div className="flex items-center gap-2">  
        <PropertyTypeIcon definition={props.definition} /> {props.definition.name}
      </div>

      <PropertyDefinitionActions 
        editorHint={props.editorHint}
        previewHint={props.previewHint}
        definition={props.definition}
        onMoveUp={props.onMoveUp}
        onMoveDown={props.onMoveDown}
        onUpdateProperty={props.onUpdateProperty}
        onDeleteProperty={props.onDeleteProperty} />
    </div>
  )

}

