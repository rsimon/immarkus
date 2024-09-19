import { W3CAnnotationBody } from '@annotorious/react';
import { EntityType } from '@/model';
import { createSafeKeys } from '../PropertiesForm/PropertyKeys';
import { 
  EnumField,
  ExternalAuthorityField, 
  GeoCoordinatesField, 
  MeasurementField, 
  NumberField, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';

interface PropertiesFormSectionProps {

  body: W3CAnnotationBody,

  entityType: EntityType;

  safeKeys: ReturnType<typeof createSafeKeys>;

  values: {[key: string]: any};

  onChange(key: string, value: any): void;

}

export const PropertiesFormSection = (props: PropertiesFormSectionProps) => {

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
            <GeoCoordinatesField
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
          /* ) : property.type === 'relation' ? (
            <RelationField
              id={key}
              definition={property} 
              value={props.values[key]}
              onChange={value => props.onChange(key, value)} />
          */) : property.type === 'text' ? (
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
    </div>
  )

}