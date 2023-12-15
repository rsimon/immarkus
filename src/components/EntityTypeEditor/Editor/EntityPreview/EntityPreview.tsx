import { Braces } from 'lucide-react';
import { getBrightness } from '@/utils/color';
import { EntityTypeStub } from '../../EntityTypeStub';
import { 
  EnumPropertyField, 
  GeoCoordinatePropertyField, 
  NumberPropertyField, 
  TextPropertyField, 
  URIPropertyField 
} from '@/components/PropertyFields';

interface EntityPreviewProps {

  entityType: EntityTypeStub;

}

export const EntityPreview = (props: EntityPreviewProps) => {

  const { entityType } = props;

  const brightness = getBrightness(entityType.color);

  return (
    <div className="bg-muted px-8 py-6 border-l">
      <h2 className="mb-6">
        Preview
      </h2>

      <div className="flex">
        <h3 
          className="rounded-full pl-2.5 pr-3.5 py-1 flex items-center text-xs"
          style={{ 
            backgroundColor: entityType.color,
            color: brightness > 0.5 ? '#000' : '#fff' 
          }}>
          <Braces className="inline h-3.5 w-3.5 mr-1.5" />
          {entityType.label || entityType.id || 'Entity Preview'}
        </h3>
      </div>

      {entityType.description && (
        <p className="text-xs text-muted-foreground p-1 mt-1">
          {entityType.description}
        </p>
      )}

      <div className="mt-2">
        {(entityType.properties || []).map(property => (
          <div className="mt-1" key={property.name}>
            {property.type === 'enum' ? (
              <EnumPropertyField 
                id={property.name}
                definition={property} />
            ) : property.type === 'geocoordinate' ? (
              <GeoCoordinatePropertyField 
                id={property.name}
                definition={property} />
            ) : property.type === 'number' ? (
              <NumberPropertyField 
                id={property.name}
                definition={property} />   
            ) : property.type === 'text' ? (
              <TextPropertyField 
                id={property.name}
                definition={property} />   
            ) : property.type === 'uri' ? (
              <URIPropertyField 
                id={property.name}
                definition={property} />   
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )

}