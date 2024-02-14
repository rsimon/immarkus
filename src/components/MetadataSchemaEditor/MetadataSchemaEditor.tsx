import { useState } from 'react';
import { PropertyDefinitionEditorDialog, moveArrayItem } from '@/components/PropertyDefinitionEditor';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';
import { MetadataListItem } from './MetadataListItem';
import { Label } from '@/ui/Label';
import { Input } from '@/ui/Input';
import { Textarea } from '@/ui/Textarea';

interface MetadataSchemaEditorProps {

  caption: string;

  editorHint: string;

  previewHint: string;

  schema?: MetadataSchema;

  onChange(updated: MetadataSchema): void;

}

export const MetadataSchemaEditor = (props: MetadataSchemaEditorProps) => {

  const [schema, setSchema] = useState<Partial<MetadataSchema>>(props.schema || {});

  const addProperty = (added: PropertyDefinition) =>
    setSchema(s => ({ 
      ...s,
      properties: [
        ...(s.properties || []),
        added
      ]
    }));

  const moveProperty = (definition: PropertyDefinition, up: boolean) =>
    setSchema(s => ({
      ...s,
      properties: moveArrayItem(s.properties, s.properties.indexOf(definition), up)
    }));

  const updateProperty = (updated: PropertyDefinition, previous: PropertyDefinition) =>
    setSchema(s => ({
      ...s,
      properties: s.properties.map(p => p === previous ? updated : p)
    }));

  const deleteProperty = (definition: PropertyDefinition) =>
    setSchema(s => ({
      ...s,
      properties: s.properties.filter(d => d !== definition)
    }));

  return (
    <article>
      <div className="p-5">
        <p className="text-sm leading-6 max-w-[60ch] pr-12">
          {props.caption}
        </p>

        <div className="mt-6">
          <Label 
            htmlFor="name"
            className="inline-block text-xs mb-1.5 ml-0.5">Schema Name
          </Label>

          <Input
            id="name"
            className="bg-white"
            value={schema.name || ''}
            onChange={evt => setSchema(s => ({ ...s, name: evt.target.value }))} />
        </div>

        <div className="mt-6">
          <Label 
            htmlFor="description"
            className="inline-block text-xs mb-1.5 ml-0.5">Schema Description</Label>

          <Textarea 
            id="description"
            className="bg-white"
            rows={3} 
            value={schema.description || ''} 
            onChange={evt => setSchema(s => ({ ...s, description: evt.target.value }))} />
        </div>

        {(schema?.properties || []).length === 0 ? (
          <div className="my-6 py-5 bg-muted w-full rounded-sm text-muted-foreground text-sm flex justify-center items-center">
            No Properties
          </div>
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