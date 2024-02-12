import { PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Metadata } from '../Metadata';

export const ImageMetadata = () => {

  const model = useDataModel();

  const properties = model.getImageSchema('default')?.properties || [];

  const editorHint = 
    'Add Properties to record specific details for your images, such as title, source, date, etc.';

  const previewHint =
    'This is how your property will appear when editing metadata in the image gallery.';

  const onChange = (updated: PropertyDefinition[]) => {
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
  }
  return (
    <Metadata 
      editorHint={editorHint} 
      previewHint={previewHint} 
      properties={properties} 
      onChange={onChange} />
  )

}