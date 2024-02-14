import { useState } from 'react';
import { MetadataTable } from '@/components/MetadataTable';
import { MetadataSchema } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { MetadataSchemaEditorDialog } from '@/components/MetadataSchemaEditor';
import { Rows3 } from 'lucide-react';

export const ImageMetadata = () => {

  const model = useDataModel();

  const [edited, setEdited] = useState<MetadataSchema | undefined>();

  const editorHint = 
    'Add Properties to record specific details for your images, such as title, source, date, etc.';

  const previewHint =
    'This is how your property will appear when editing metadata in the image gallery.';

  const onSave = (updated: MetadataSchema) => {
    /*
    const schema = model.getImageSchema('default');
    if (schema) {
      model.updateImageSchema({
        ...schema,
        properties: updated
      });
    } else {
      model.addImageSchema({
        name: 'default',
        properties: updated
      });
    }
    */
  }

  const onDelete = (schemaName: string) => {
    console.log('deleting', schemaName);
  }

  return (
    <div>
      <MetadataTable
        schemas={model.imageSchemas}
        onEditSchema={setEdited}
        onDeleteSchema={onDelete} />

      <div className="mt-4">
        <MetadataSchemaEditorDialog
          caption="Define a metadata schema to record structured information about your images."
          editorHint={editorHint}
          previewHint={previewHint}
          onSave={onSave}>
          <Button>
            <Rows3 className="w-4 h-4 mr-2" /> Add Schema
          </Button>
        </MetadataSchemaEditorDialog>
      </div>

      <MetadataSchemaEditorDialog
        open={Boolean(edited)} 
        caption="Define a metadata schema to record structured information about your images."
        editorHint={editorHint}
        previewHint={previewHint}
        schema={edited}
        onSave={onSave}
        onOpenChange={open => !open && setEdited(undefined)} />
    </div>
  )

}