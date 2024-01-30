import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/ui/Button';
import { PanelTop } from 'lucide-react';

interface ImageMetadataPanelProps {

  image: ImageGridItem;

}

export const ImageMetadataPanel = (props: ImageMetadataPanelProps) => {

  const navigate = useNavigate();

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

  const onOpen = () =>
    navigate(`/annotate/${props.image.id}`);

  return (
    <PropertyValidation>
      <div className="flex flex-col justify-between h-full">
        <div>
          <h2 className="leading-relaxed mr-5 mb-8 font-medium">
            {props.image.name}
          </h2>
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

        <div className="pt-2 pb-4">
          <Button disabled className="w-full mb-2">
            Save Metadata
          </Button>

          <Button 
            variant="outline"
            className="w-full"
            onClick={onOpen}>
            <PanelTop className="h-4 w-4 mr-2" /> Open Image
          </Button>
        </div>
      </div>
    </PropertyValidation>
  )

}