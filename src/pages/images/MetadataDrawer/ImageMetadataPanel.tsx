import { PropertyDefinition } from '@/model';
import { useDataModel, useImageMetadata } from '@/store';
import { ImageGridItem } from '../ItemGrid';
import { 
  EnumField, 
  ExternalAuthorityField, 
  GeoCoordinateField, 
  MeasurementField, 
  NumberField, 
  PropertyValidation, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';

interface ImageMetadataPanelProps {

  image: ImageGridItem;

}

export const ImageMetadataPanel = (props: ImageMetadataPanelProps) => {

  const model = useDataModel();

  const { metadata, updateMetadata } = useImageMetadata(props.image?.id);

  const schema = metadata 
    ? model.getImageSchema(metadata.source || 'default') 
    : model.getImageSchema('default');

  const getValue = (definition: PropertyDefinition) => {
    if (metadata && 'properties' in metadata)
      return metadata.properties[definition.name];
  }

  const onChange = (definition: PropertyDefinition, value: any) => {
    console.log('change', definition.name, value);
  }

  return (
    <PropertyValidation>
      <div>
        {Boolean(schema) ? (
          <ul>
            {(schema.properties || []).map(definition => (
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
            ))}
          </ul>
        ) : (
          <div>No schema...</div>
        )}
      </div>
    </PropertyValidation>
  )

}