import { useEffect, useState } from 'react';
import { ToyBrick } from 'lucide-react';
import { Link } from 'react-router-dom';
import { W3CAnnotationBody } from '@annotorious/react';
import { MetadataSchema } from '@/model';
import { useDataModel } from '@/store';
import { Separator } from '@/ui/Separator';
import { MetadataForm } from './MetadataForm';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface ImageMetadataFormProps {

  metadata: W3CAnnotationBody;

  onChange(metadata: W3CAnnotationBody): void;

}

export const ImageMetadataForm = (props: ImageMetadataFormProps) => {

  const { metadata } = props;

  const model = useDataModel();

  // All image schemas in the data model
  const schemas = model.imageSchemas;

  // The schema selected for this image
  const [selectedSchema, setSelectedSchema] = useState<MetadataSchema | undefined>();

  useEffect(() => {
    if (schemas.length === 1) {
      // No need for user selection if only one schema available!
      setSelectedSchema(schemas[0]);
    } else {
      // If more than one schema, choose based on metadata source
      if (metadata)
        setSelectedSchema(model.getImageSchema(metadata.source));
    }
  }, [metadata]);

  const onChangeSchema = (name: string) => {
    setSelectedSchema(model.getImageSchema(name));
    props.onChange({
      ...metadata,
      source: name
    })
  }
  
  return schemas.length === 0 ? (
    <div className="flex flex-col text-sm items-center px-2 justify-center text-center flex-grow leading-loose text-muted-foreground">
      <span>
        No image schema defined.<br/>
        Go to <Link to="/model" className="inline-block text-black hover:bg-muted px-1 rounded-sm"><ToyBrick className="inline h-4 w-4 align-text-top" /> Data Model</Link> to 
        define one.
      </span>
    </div>
  ) : schemas.length === 1 && selectedSchema ? (
    <MetadataForm 
      metadata={metadata} 
      properties={selectedSchema.properties}
      onChange={props.onChange} />
  ) : (
    <div className="text-sm">
      <div className="flex gap-4 items-center">
        <span className="font-medium">Schema</span>

        <Select value={selectedSchema?.name} onValueChange={onChangeSchema}>
          <SelectTrigger className="flex-grow">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {schemas.map(schema => (
              <SelectItem key={schema.name} value={schema.name}>{schema.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="mt-5 mb-5" />

      {selectedSchema && (
        <MetadataForm 
          metadata={metadata} 
          properties={selectedSchema.properties}
          onChange={props.onChange} />
      )}
    </div>
  )

}