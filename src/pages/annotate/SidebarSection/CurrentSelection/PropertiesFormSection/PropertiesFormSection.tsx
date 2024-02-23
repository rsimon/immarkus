import { Settings, Trash2 } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { EntityType } from '@/model';
import { EntityBadge } from '@/components/EntityBadge';
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { TooltippedButton } from '@/components/TooltippedButton';
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
      <div className="flex justify-between items-center mb-6">
        <EntityBadge entityType={entityType} />

        <div className="flex text-muted-foreground">
          <EntityTypeEditor entityType={entityType}>
            <TooltippedButton 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8"
              tooltip="Edit schema">
              <Settings className="h-4 w-4" />
            </TooltippedButton>
          </EntityTypeEditor>

          <TooltippedButton 
            variant="ghost" 
            size="icon" 
            type="button"
            className="rounded-full h-8 w-8 -ml-1 hover:text-red-500"
            tooltip="Delete tag">
            <Trash2 className="h-4 w-4" />
          </TooltippedButton>
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
      </div>
    </div>
  )

}