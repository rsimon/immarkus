import { PropertyDefinitionEditorDialog } from '@/components/PropertyDefinitionEditor';
import { PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';

export const ImageMetadata = () => {

  const editorHint = 
    'Add Properties to record specific details for your images, such as title, source, date, etc.';

  const previewHint =
    'This is how your property will appear when editing metadata in the image gallery.';

  const onSave = (definition: PropertyDefinition) => {
    console.log('saving', definition);
  }

  return (
    <>
      <p className="p-1 mt-4 text-sm max-w-xl leading-6">
        Define a metadata schema to record structured information about your images. 
      </p>

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