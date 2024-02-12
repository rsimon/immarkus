import { PropertyDefinitionEditorDialog, moveArrayItem } from '@/components/PropertyDefinitionEditor';
import { PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { MetadataListItem } from '../MetadataListItem';

export const FolderMetadata = () => {

  const model = useDataModel();

  const properties = model.getFolderSchema('default')?.properties || [];

  const editorHint = 
    'Add Properties to record specific details for your folders, such as title, source, date, etc.';

  const previewHint =
    'This is how your property will appear when editing folder metadata in the image gallery.';

  const onChange = (updated: PropertyDefinition[]) => {
    const schema = model.getFolderSchema('default');
    if (schema) {
      model.updateFolderSchema({
        ...schema,
        properties: updated
      });
    } else {
      model.addFolderSchema({
        name: 'default',
        properties: updated
      });
    }
  }

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
        Define a metadata schema to record structured information about your folders. 
      </p>

      {properties.length === 0 ? (
        <div className="h-8 mt-3" />
      ) : (
        <ul className="max-w-sm mt-8 mb-12">
          {properties.map(definition => (
            <li key={definition.name}>
              <MetadataListItem 
                editorHint={editorHint}
                previewHint={previewHint}
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
        editorHint={editorHint}
        previewHint={previewHint}
        onSave={addProperty}>
        <Button>
          Add Folder Property
        </Button>
      </PropertyDefinitionEditorDialog>
    </>
  )

}