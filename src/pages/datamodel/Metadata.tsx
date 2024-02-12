import { PropertyDefinitionEditorDialog, moveArrayItem } from '@/components/PropertyDefinitionEditor';
import { PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';
import { MetadataListItem } from './MetadataListItem';

interface MetadataProps {

  editorHint: string;

  previewHint: string;

  properties: PropertyDefinition[];

  onChange(updated: PropertyDefinition[]): void;

}

export const Metadata = (props: MetadataProps) => {

  const { properties, onChange } = props;

  const addProperty = (added: PropertyDefinition) =>
    onChange([...properties, added]);

  const moveProperty = (definition: PropertyDefinition, up: boolean) =>
    onChange(moveArrayItem(properties, properties.indexOf(definition), up));

  const updateProperty = (updated: PropertyDefinition, previous: PropertyDefinition) =>
    onChange(properties.map(p => p === previous ? updated : p));

  const deleteProperty = (definition: PropertyDefinition) =>
    onChange(properties.filter(d => d !== definition));

  return (
    <>
      <p className="p-1 mt-4 text-sm max-w-xl leading-6">
        Define a metadata schema to record structured information about your images. 
      </p>

      {properties.length === 0 ? (
        <div className="h-8 mt-3" />
      ) : (
        <ul className="max-w-sm mt-8 mb-12">
          {properties.map(definition => (
            <li key={definition.name}>
              <MetadataListItem 
                editorHint={props.editorHint}
                previewHint={props.previewHint}
                definition={definition} 
                onMoveUp={() => moveProperty(definition, true)}
                onMoveDown={() => moveProperty(definition, false)}
                onUpdateProperty={updated => updateProperty(updated, definition)}
                onDeleteProperty={() => deleteProperty(definition)} />
            </li>
          ))}
        </ul>
      )}

      <PropertyDefinitionEditorDialog
        editorHint={props.editorHint}
        previewHint={props.previewHint}
        onSave={addProperty}>
        <Button>
          Add Metadata Property
        </Button>
      </PropertyDefinitionEditorDialog>
    </>
  )

}