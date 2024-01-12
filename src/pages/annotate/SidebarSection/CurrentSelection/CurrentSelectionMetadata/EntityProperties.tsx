import { EntityType } from '@/model';
import { createSafeKeys } from './PropertyKeys';
import { W3CAnnotationBody } from '@annotorious/react';
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { 
  EnumField,
  ExternalAuthorityField, 
  GeoCoordinateField, 
  MeasurementField, 
  NumberField, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';
import { Button } from '@/ui/Button';

interface EntityPropertiesProps {

  body: W3CAnnotationBody,

  entityType: EntityType;

  safeKeys: ReturnType<typeof createSafeKeys>;

  values: {[key: string]: any};

  onChange(key: string, value: any): void;

}

export const EntityProperties = (props: EntityPropertiesProps) => {

  const { body, entityType, safeKeys } = props;

  const fields = (entityType.properties || [])
    .map(property => ({ 
      property, 
      key: safeKeys.getKey(body, property.name)
    }));
  
  return (
    <div>
      {fields.map(({ property, key }) => (
        <div className="mt-2" key={key}>
          {property.type === 'enum' ? (
            <EnumField
              id={key}
              definition={property} 
              value={props.values[key]}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'external_authority' ? (
            <ExternalAuthorityField
              id={key}
              definition={property} 
              value={props.values[key]}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'geocoordinate' ? (
            <GeoCoordinateField
              id={key}
              definition={property} 
              value={props.values[key]}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'measurement' ? (
            <MeasurementField
              id={key}
              definition={property} 
              value={props.values[key]}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'number' ? (
            <NumberField
              id={key}
              definition={property} 
              value={props.values[key]}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'text' ? (
            <TextField 
              id={key}
              definition={property} 
              value={props.values[key]}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'uri' ? (
            <URIField 
              id={key}
              definition={property} 
              value={props.values[key]}
              onChange={value => props.onChange(key, value)} />
          ) : null }
        </div>
      ))}

      <div className="flex justify-end -mt-5 -mb-4">
        <EntityTypeEditor entityType={entityType}>
          <Button 
            type="button"
            variant="link" 
            className="text-xs text-muted-foreground p-0.5">
            Edit Schema</Button>
        </EntityTypeEditor>
      </div>
    </div>
  )

}