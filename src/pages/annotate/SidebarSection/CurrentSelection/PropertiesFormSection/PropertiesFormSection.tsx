import { EntityType } from '@/model';
import { createSafeKeys } from '../PropertiesForm/PropertyKeys';
import { W3CAnnotationBody } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { 
  EnumField,
  ExternalAuthorityField, 
  GeoCoordinatesField, 
  MeasurementField, 
  NumberField, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';
import { EntityBadge } from '@/components/EntityBadge';

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
      <div className="flex justify-between items-center">
        <EntityBadge entityType={entityType} />

        <div>
          <button>edit</button>
          <button>delete</button>
        </div>
      </div>
      
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
    </div>
  )

}