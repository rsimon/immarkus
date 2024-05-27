import { useState } from 'react';
import { MetadataTable } from '@/components/MetadataTable';
import { MetadataSchema } from '@/model';
import { useDataModel, useStore } from '@/store';
import { renameFolderSchema } from '@/store/integrity';
import { Button } from '@/ui/Button';
import { MetadataSchemaEditorDialog } from '@/components/MetadataSchemaEditor';
import { Import, Rows3 } from 'lucide-react';
import { DataModelImport } from '@/components/DataModelImport';

export const FolderMetadata = () => {

  const store = useStore();

  const model = useDataModel();

  const [edited, setEdited] = useState<MetadataSchema | undefined>();

  const editorHint = 
    'Add Properties to record specific details for your folders, such as title, source, date, etc.';

  const previewHint =
    'This is how your property will appear when editing metadata in the image gallery.';

  const onSave = (updated: MetadataSchema, previous?: MetadataSchema) => {
    if (previous && previous.name === updated.name) {
      model.updateFolderSchema(updated);
    } else {
      if (previous) {
        // An 'update' that renamed the unique name!
        renameFolderSchema(previous.name, updated.name, store);

        model.removeFolderSchema(previous)
          .then(() => model.addFolderSchema(updated));
      } else {
        model.addFolderSchema(updated);
      }
    }
  }

  const onDelete = (schemaName: string) =>
    model.removeFolderSchema(schemaName);

  return (
    <div>
      <p className="p-1 mt-4 text-sm max-w-2xl leading-6">
        Use schemas to record structured information about your folders.
        Create multiple schemas to describe different folder types, e.g. 'Map Series' vs. 'Photo Collection'.
      </p>

      <MetadataTable
        schemas={model.folderSchemas}
        onEditSchema={setEdited}
        onDeleteSchema={onDelete} />

      <div className="flex gap-2 mt-4">
        <MetadataSchemaEditorDialog
          editorHint={editorHint}
          previewHint={previewHint}
          existingSchemas={model.folderSchemas}
          onSave={onSave}>
          <Button>
            <Rows3 className="w-4 h-4 mr-2" /> New Folder Schema
          </Button>
        </MetadataSchemaEditorDialog>

        <DataModelImport type="FOLDER_SCHEMAS">
          <Button variant="outline">
            <Import className="h-4 w-4 mr-2" /> Import Model
          </Button>
        </DataModelImport>
      </div>

      <MetadataSchemaEditorDialog
        open={Boolean(edited)} 
        editorHint={editorHint}
        previewHint={previewHint}
        schema={edited}
        existingSchemas={model.folderSchemas}
        onSave={onSave}
        onOpenChange={open => !open && setEdited(undefined)} />
    </div>
  )

}