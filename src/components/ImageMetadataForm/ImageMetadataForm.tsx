import { ToyBrick } from 'lucide-react';
import { Link } from 'react-router-dom';
import { W3CAnnotationBody } from '@annotorious/react';
import { ImageMetadataSchema, PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { 
  EnumField, 
  ExternalAuthorityField, 
  GeoCoordinateField, 
  MeasurementField, 
  NumberField, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';

interface ImageMetadataFormProps {

  metadata: W3CAnnotationBody;

  onChange(metadata: W3CAnnotationBody): void;

}

const parseBody = (body?: W3CAnnotationBody, schema?: ImageMetadataSchema) => {
  if (schema && body && 'properties' in body) {
    const entries = (schema.properties || []).map(definition => (
      [definition.name, body.properties[definition.name]]
    )).filter(t => Boolean(t[1]));

    return Object.fromEntries(entries);
  } else {
    return {};
  }
}

export const ImageMetadataForm = (props: ImageMetadataFormProps) => {

  const model = useDataModel();

  const { metadata } = props;

  const schema = metadata 
    ? model.getImageSchema(metadata.source || 'default') 
    : model.getImageSchema('default');

  const formState = parseBody(metadata, schema);
  
  const getValue = (definition: PropertyDefinition) => formState[definition.name];

  const onChange = (definition: PropertyDefinition, value: any) => {
    const next = {
      ...metadata,
      properties: formState
    };

    if (value) {
      next.properties[definition.name] = value;
    } else {
      delete next.properties[definition.name];
    }

    props.onChange(next);
  }

  return Boolean(schema) ?
    (schema.properties || []).map(definition => (
      <div className="mt-2" key={definition.name}>
        {definition.type === 'enum' ? (
          <EnumField
            id={definition.name}
            definition={definition} 
            value={getValue(definition)}
            onChange={value => onChange(definition, value)} />
        ) : definition.type === 'external_authority' ? (
          <ExternalAuthorityField
            id={definition.name}
            definition={definition} 
            value={getValue(definition)}
            onChange={value => onChange(definition, value)} />
        ) : definition.type === 'geocoordinate' ? (
          <GeoCoordinateField
            id={definition.name}
            definition={definition} 
            value={getValue(definition)}
            onChange={value => onChange(definition, value)} />
        ) : definition.type === 'measurement' ? (
          <MeasurementField
            id={definition.name}
            definition={definition} 
            value={getValue(definition)}
            onChange={value => onChange(definition, value)} />
        ) : definition.type === 'number' ? (
          <NumberField
            id={definition.name}
            definition={definition} 
            value={getValue(definition)}
            onChange={value => onChange(definition, value)} />
        ) : definition.type === 'text' ? (
          <TextField 
            id={definition.name}
            definition={definition} 
            value={getValue(definition)}
            onChange={value => onChange(definition, value)} />
        ) : definition.type === 'uri' ? (
          <URIField 
            id={definition.name}
            definition={definition} 
            value={getValue(definition)}
            onChange={value => onChange(definition, value)} />
        ) : null }
      </div>
    )
  ) : (
    <div className="flex flex-col text-sm items-center px-2 justify-center text-center flex-grow leading-loose text-muted-foreground">
      <span>
        No image metadata model.<br/>
        Go to <Link to="/model" className="inline-block text-black hover:bg-muted px-1 rounded-sm"><ToyBrick className="inline h-4 w-4 align-text-top" /> Data Model</Link> to 
        define one.
      </span>
    </div>
  )

}