import { PropertyDefinitionEditorDialog } from '@/components/PropertyDefinitionEditor';
import { PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';

export const ImageMetadata = () => {

  const model = useDataModel();

  const editorHint = 
    'Add Properties to record specific details for your images, such as title, source, date, etc.';

  const previewHint =
    'This is how your property will appear when editing metadata in the image gallery.';

  const onSave = (definition: PropertyDefinition) => {
    // For testing only!
    const schema = model.getImageSchema('default');
    if (schema) {
      model.updateImageSchema({
        ...schema,
        properties: [
          ...(schema.properties || []),
          definition
        ]
      });
    } else {
      model.addImageSchema({
        name: 'default',
        properties: [definition]
      });
    }
  }

  const properties = model.getImageSchema('default')?.properties;

  return (
    <>
      <p className="p-1 mt-4 text-sm max-w-xl leading-6">
        Define a metadata schema to record structured information about your images. 
      </p>

      <ul>
        {properties?.length > 0 && properties.map(p => (
          <li key={p.name}>{p.name}</li>
        ))}
      </ul>

      <PropertyDefinitionEditorDialog
        editorHint={editorHint}
        previewHint={previewHint}
        onSave={onSave}>
        <Button>
          Add Property
        </Button>
      </PropertyDefinitionEditorDialog>
    </>
  )

}