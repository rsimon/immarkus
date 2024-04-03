import { useEffect, useState } from 'react';
import { ToyBrick } from 'lucide-react';
import { Link } from 'react-router-dom';
import { W3CAnnotationBody } from '@annotorious/react';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { Separator } from '@/ui/Separator';
import { 
  EnumField, 
  ExternalAuthorityField, 
  GeoCoordinatesField, 
  MeasurementField, 
  NumberField, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface MetadataFormProps {

  metadata: W3CAnnotationBody;

  schemas: MetadataSchema[];

  onChange(metadata: W3CAnnotationBody): void;

}

const parseBody = (body?: W3CAnnotationBody, properties?: PropertyDefinition[]) => {
  if (body && 'properties' in body) {
    const entries = (properties || []).map(definition => (
      [definition.name, body.properties[definition.name]]
    )).filter(t => Boolean(t[1]));

    return Object.fromEntries(entries);
  } else {
    return {};
  }
}

export const MetadataForm = (props: MetadataFormProps) => {

  const { metadata, schemas } = props;

  const [selectedSchema, setSelectedSchema] = useState<MetadataSchema | undefined>();

  const formState = parseBody(metadata, selectedSchema?.properties);

  useEffect(() => {
    if (schemas.length === 1) {
      // No need for user selection if only one schema available!
      setSelectedSchema(schemas[0]);
    } else {
      // If more than one schema, choose based on metadata source
      if (metadata)
        setSelectedSchema(props.schemas.find(s => s.name === metadata.source));
    }
  }, [props.schemas, metadata]);

  const onChangeSchema = (name: string) => {
    setSelectedSchema(schemas.find(s => s.name === name));
    props.onChange({
      ...metadata,
      source: name
    })
  }

  const getValue = (definition: PropertyDefinition) => formState[definition.name];

  const onChangeValue = (definition: PropertyDefinition, value: any) => {
    const next = {
      ...metadata,
      source: selectedSchema.name,
      properties: formState
    };

    if (value) {
      next.properties[definition.name] = value;
    } else {
      delete next.properties[definition.name];
    }

    props.onChange(next);
  }

  return schemas.length === 0 ? (
    <div className="flex flex-col text-sm items-center px-2 justify-center text-center flex-grow leading-loose text-muted-foreground">
      <span>
        No schema defined.<br/>
        Go to <Link to="/model" className="inline-block text-black hover:bg-muted px-1 rounded-sm"><ToyBrick className="inline h-4 w-4 align-text-top" /> Data Model</Link> to 
        define one.
      </span>
    </div>
  ) : (
    <div>
      {schemas.length > 1 && (
        <>
          <div className="flex gap-4 items-center">
            <span className="font-medium">Schema</span>
    
            <Select value={selectedSchema?.name} onValueChange={onChangeSchema}>
              <SelectTrigger className="flex-grow whitespace-nowrap overflow-hidden">
                <span className="overflow-hidden text-ellipsis">
                  <SelectValue />
                </span>
              </SelectTrigger>
    
              <SelectContent>
                {schemas.map(schema => (
                  <SelectItem key={schema.name} value={schema.name}>{schema.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="mt-5 mb-8" />
        </>
      )}

      <div>
        {(selectedSchema?.properties || []).map(definition => (
          <div className="mt-2" key={definition.name}>
            {definition.type === 'enum' ? (
              <EnumField
                id={definition.name}
                definition={definition} 
                value={getValue(definition)}
                onChange={value => onChangeValue(definition, value)} />
            ) : definition.type === 'external_authority' ? (
              <ExternalAuthorityField
                id={definition.name}
                definition={definition} 
                value={getValue(definition)}
                onChange={value => onChangeValue(definition, value)} />
            ) : definition.type === 'geocoordinate' ? (
              <GeoCoordinatesField
                id={definition.name}
                definition={definition} 
                value={getValue(definition)}
                onChange={value => onChangeValue(definition, value)} />
            ) : definition.type === 'measurement' ? (
              <MeasurementField
                id={definition.name}
                definition={definition} 
                value={getValue(definition)}
                onChange={value => onChangeValue(definition, value)} />
            ) : definition.type === 'number' ? (
              <NumberField
                id={definition.name}
                definition={definition} 
                value={getValue(definition)}
                onChange={value => onChangeValue(definition, value)} />
            ) : definition.type === 'text' ? (
              <TextField 
                id={definition.name}
                definition={definition} 
                value={getValue(definition)}
                onChange={value => onChangeValue(definition, value)} />
            ) : definition.type === 'uri' ? (
              <URIField 
                id={definition.name}
                definition={definition} 
                value={getValue(definition)}
                onChange={value => onChangeValue(definition, value)} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )

}