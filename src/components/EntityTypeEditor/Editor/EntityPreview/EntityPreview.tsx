import { useMemo } from 'react';
import { Cuboid } from 'lucide-react';
import { getBrightness } from '@/utils/color';
import { PropertyDefinition } from '@/model';
import { useStore } from '@/store';
import { EntityTypeStub } from '../../EntityTypeStub';
import { 
  EnumField,
  ExternalAuthorityField, 
  GeoCoordinateField, 
  NumberField, 
  TextField, 
  URIField 
} from '@/components/PropertyFields';
import { Separator } from '@/ui/Separator';

interface EntityPreviewProps {

  entityType: EntityTypeStub;

}

export const EntityPreview = (props: EntityPreviewProps) => {

  const { entityType } = props;

  const { parentId } = entityType;

  const store = useStore();

  const brightness = getBrightness(entityType.color);

  const inheritedProps: PropertyDefinition[] = useMemo(() => {
    if (parentId) {
      const inherited = store.getEntityType(parentId, true)?.properties;
      return (inherited || []).map(p => p.inheritedFrom ? p : ({ ...p, inheritedFrom: parentId }));
    } else {
      return [];
    }
  }, [parentId]);

  const properties = [...inheritedProps, ...(entityType.properties || [])];

  return (
    <div className="bg-muted px-8 py-6 border-l">
      <h2>
        Entity Preview
      </h2>

      <p className="text-left text-xs leading-relaxed text-muted-foreground mt-1 mb-8">
        This is how your properties will appear when editing an entity in the annotation interface.
      </p>

      <div className="flex mb-1">
        <h3 
          className="rounded-full pl-2.5 pr-3.5 py-1 flex items-center text-xs"
          style={{ 
            backgroundColor: entityType.color,
            color: brightness > 0.5 ? '#000' : '#fff' 
          }}>
          <Cuboid className="inline h-3.5 w-3.5 mr-1.5" />
          {entityType.label || entityType.id || 'Entity Preview'}
        </h3>
      </div>

      {entityType.description ? (
        <>
          <p className="text-xs text-muted-foreground p-1 mt-1.5">
            {entityType.description}
          </p>

          <Separator className="mt-1.5 mb-3 bg-slate-300/50" />
        </>
      ) : (
        <Separator className="mt-3 mb-3 bg-slate-300/50" />
      )}

      <div>
        {properties.map(property => (
          <div className="mt-1" key={property.name}>
            {property.type === 'enum' ? (
              <EnumField 
                id={property.name}
                className="bg-white" 
                definition={property} />
            ) : property.type === 'external_authority' ? (
              <ExternalAuthorityField 
                id={property.name}
                className="bg-white" 
                definition={property} />
            ) : property.type === 'geocoordinate' ? (
              <GeoCoordinateField 
                id={property.name}
                className="bg-white" 
                definition={property} />
            ) : property.type === 'number' ? (
              <NumberField 
                id={property.name}
                className="bg-white" 
                definition={property} />   
            ) : property.type === 'text' ? (
              <TextField 
                id={property.name}
                className="bg-white" 
                definition={property} />   
            ) : property.type === 'uri' ? (
              <URIField 
                id={property.name}
                className="bg-white" 
                definition={property} />   
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )

}