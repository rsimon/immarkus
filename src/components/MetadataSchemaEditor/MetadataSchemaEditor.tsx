import { PropertyDefinitionEditorDialog, moveArrayItem } from '@/components/PropertyDefinitionEditor';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';
import { MetadataListItem } from './MetadataListItem';

interface MetadataSchemaEditorProps {

  caption: string;

  editorHint: string;

  previewHint: string;

  schema?: MetadataSchema;

  onChange(updated: MetadataSchema): void;

}

export const MetadataSchemaEditor = (props: MetadataSchemaEditorProps) => {

  const { schema } = props;

  const addProperty = (added: PropertyDefinition) => {
    // onChange([...properties, added]);
  }

  const moveProperty = (definition: PropertyDefinition, up: boolean) => {
    // onChange(moveArrayItem(properties, properties.indexOf(definition), up));
  }

  const updateProperty = (updated: PropertyDefinition, previous: PropertyDefinition) => {
    // onChange(properties.map(p => p === previous ? updated : p));
  }

  const deleteProperty = (definition: PropertyDefinition) => {
    // onChange(properties.filter(d => d !== definition));
  }

  return (
    <article>
      <div className="p-5">
        <p className="text-sm leading-6 max-w-[60ch] pr-12">
          {props.caption}
        </p>

        {schema?.properties.length === 0 ? (
          <div className="h-8 mt-3" />
        ) : (
          <ul className="max-w-sm mt-8 mb-12">
            {(schema?.properties || []).map(definition => (
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
      </div>
    </article>
  )

}