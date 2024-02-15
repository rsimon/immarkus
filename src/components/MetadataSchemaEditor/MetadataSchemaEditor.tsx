import { useState } from 'react';
import { PropertyDefinitionEditorDialog, moveArrayItem } from '@/components/PropertyDefinitionEditor';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';
import { MetadataListItem } from './MetadataListItem';
import { Label } from '@/ui/Label';
import { Input } from '@/ui/Input';
import { Textarea } from '@/ui/Textarea';
import { AlertCircle, CheckCircle2, PlusCircle, Rows3 } from 'lucide-react';
import { MetadataSchemaPreview } from './MetadataSchemaPreview';

interface MetadataSchemaEditorProps {

  editorHint: string;

  existingSchemas: MetadataSchema[];

  previewHint: string;

  schema?: MetadataSchema;

  onSave(schema: MetadataSchema): void;

}

export const MetadataSchemaEditor = (props: MetadataSchemaEditorProps) => {

  const [schema, setSchema] = useState<Partial<MetadataSchema>>(props.schema || {});

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const isNameAvailable = props.schema
    // Editing existing - check if schema with the name is props.schema.name
    ? !props.existingSchemas.some(s => s.name === schema.name) 
      || props.existingSchemas.find(s => s.name === schema.name).name === props.schema.name

    // Not editing an existing entity - check if any exists with same ID
    : !props.existingSchemas.some(s => s.name === schema.name);

  const onSave = () => {
    if (schema.name) {
      if (!props.existingSchemas.some(s => s.name === schema.name)) {
        setErrors({});
        props.onSave(schema as MetadataSchema);
      }
    } else {
      setErrors({ name_missing: true });
    }
  }

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
    <article
      className="grid grid-cols-2 rounded-lg">
      <div className="p-5">
        <div className="mt-6">
          <Label 
            htmlFor="name"
            className="inline-block text-xs mb-1.5 ml-0.5">Schema Name
          </Label>

          {errors.name_missing && (<span className="text-xs text-red-600 ml-1">required</span>)}

          <Input
            id="name"
            className={errors.name_missing ? 'bg-white border-red-500' : 'bg-white'} 
            value={schema.name || ''}
            onChange={evt => setSchema(s => ({ ...s, name: evt.target.value }))} />

          {schema.name && (!isNameAvailable ? (
            <span className="flex items-center text-xs mt-3 text-red-600 whitespace-nowrap">
              <AlertCircle className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> Schema already exists
            </span>
          ) : ((props.schema && isNameAvailable) || !props.schema) && (
            <span className="flex items-center text-xs mt-2 text-green-600 whitespace-nowrap">
              <CheckCircle2 className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> {schema.name} is available
            </span>
          ))}
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
            <PropertyDefinitionEditorDialog
              editorHint={props.editorHint}
              previewHint={props.previewHint}
              onSave={addProperty}>
              <Button className="flex items-center" variant="ghost">
                <PlusCircle className="h-4 w-4 mr-1.5" /> Add Property
              </Button>
            </PropertyDefinitionEditorDialog>
          </div>
        ) : (
          <div className="mt-6 pt-2 pb-4 px-4 bg-muted w-full rounded-sm text-muted-foreground text-sm">
            <ul>
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

            <div className="flex justify-end">
              <PropertyDefinitionEditorDialog
                editorHint={props.editorHint}
                previewHint={props.previewHint}
                onSave={addProperty}>
                <Button 
                  variant="outline" 
                  className="text-xs mt-3 h-9 pl-2 px-3 font-medium hover:bg-muted-foreground/5">
                  Add Property
                </Button>
              </PropertyDefinitionEditorDialog>
            </div>
          </div>
        )}

        <Button className="w-full mt-7" onClick={onSave}>
          <Rows3 className="w-4 h-4 mr-2" /> Save Schema
        </Button>
      </div>

      <MetadataSchemaPreview schema={schema} />
    </article>
  )

}