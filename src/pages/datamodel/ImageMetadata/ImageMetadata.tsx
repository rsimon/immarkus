import { useState } from 'react';
import { MetadataTable } from '@/components/MetadataTable';
import { MetadataSchema } from '@/model';
import { useDataModel, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { MetadataSchemaEditorDialog } from '@/components/MetadataSchemaEditor';
import { Rows3 } from 'lucide-react';
import { renameImageSchema } from '@/store/integrity';

export const ImageMetadata = () => {

  const store = useStore();

  const model = useDataModel();

  const [edited, setEdited] = useState<MetadataSchema | undefined>();

  const editorHint = 
    'Add Properties to record specific details for your images, such as title, source, date, etc.';

  const previewHint =
    'This is how your property will appear when editing metadata in the image gallery.';

  const onSave = (updated: MetadataSchema, previous?: MetadataSchema) => {
    if (previous && previous.name === updated.name) {
      model.updateImageSchema(updated);
    } else {
      if (previous) {
        // An 'update' that renamed the unique name!
        model.removeImageSchema(previous.name);
        renameImageSchema(previous.name, updated.name, store);
      }

      model.addImageSchema(updated);
    }
  }

  const onDelete = (schemaName: string) =>
    model.removeImageSchema(schemaName);

  return (
    <div>
      <p className="p-1 mt-4 text-sm max-w-2xl leading-6">
        Use schemas to record structured information about your images, such as title, author or source.
        Create multiple schemas to describe different types of images, e.g. 'Map' vs. 'Photo'.
      </p>

      <MetadataTable
        schemas={model.imageSchemas}
        onEditSchema={setEdited}
        onDeleteSchema={onDelete} />

      <div className="mt-4">
        <MetadataSchemaEditorDialog
          editorHint={editorHint}
          previewHint={previewHint}
          existingSchemas={model.imageSchemas}
          onSave={onSave}>
          <Button>
            <Rows3 className="w-4 h-4 mr-2" /> New Image Schema
          </Button>
        </MetadataSchemaEditorDialog>
      </div>

      <MetadataSchemaEditorDialog
        open={Boolean(edited)} 
        editorHint={editorHint}
        previewHint={previewHint}
        schema={edited}
        existingSchemas={model.imageSchemas}
        onSave={onSave}
        onOpenChange={open => !open && setEdited(undefined)} />
    </div>
  )

}