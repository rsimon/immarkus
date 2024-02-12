import { PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Metadata } from '../Metadata';

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
  return (
    <Metadata 
      editorHint={editorHint} 
      previewHint={previewHint} 
      properties={properties} 
      onChange={onChange} />
  )

}