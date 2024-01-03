import { EnumPropertyDefinition, PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { PropertyDefinitionStub } from './PropertyDefinitionStub';
import { 
  EnumField,
  ExternalAuthorityField,
  GeoCoordinateField, 
  NumberField, 
  PropertyTypeIcon, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';

interface PropertyPreviewProps {

  property: PropertyDefinitionStub;

}

export const PropertyPreview = (props: PropertyPreviewProps) => {

  const stub = props.property;

  const preview = {
    ...stub,
    name: stub.name || '',
  } as PropertyDefinition;

  return (
    <div className="bg-muted px-8 py-4 border-l col-span-2">
      <h2 className="font-medium">
        Property Preview
      </h2>

      <p className="text-left text-xs leading-relaxed mt-1 mb-12">
        This is how your property will appear when editing an entity in 
        the annotation interface. 
      </p>

      {stub.name && (
        <div className="mt-1" key={preview.name}>
          {preview.type === 'enum' ? (
            <EnumField 
              id={preview.name}
              className="bg-white"
              definition={preview as EnumPropertyDefinition} />
          ) : preview.type === 'external_authority' ? (
            <ExternalAuthorityField 
              id={preview.name}
              className="bg-white"
              definition={preview} />
          ) : preview.type === 'geocoordinate' ? (
            <GeoCoordinateField 
              id={preview.name}
              className="bg-white"
              definition={preview} />
          ) : preview.type === 'number' ? (
            <NumberField 
              id={preview.name}
              className="bg-white"
              definition={preview} />   
          ) : preview.type === 'text' ? (
            <TextField 
              id={preview.name}
              className="bg-white"
              definition={preview} />   
          ) : preview.type === 'uri' ? (
            <URIField 
              id={preview.name}
              className="bg-white"
              definition={preview} />   
          ) : (
            <Label 
              className="text-xs block mt-3 mb-1.5">
              {preview.name}
            </Label>
          )}
        </div>
      )}
    </div>
  )

}