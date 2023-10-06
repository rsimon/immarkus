import { getBrightness } from './entityColor';
import { EntityStub } from './EntityDetails';

interface EntityPreviewProps {

  entity: EntityStub;

}

export const EntityPreview = (props: EntityPreviewProps) => {

  const { entity } = props;

  const brightness = getBrightness(entity.color);

  return (
    <div className="bg-muted">
        <div className="flex justify-center mb-8">
          <h2 
            className="rounded-full px-2.5 py-1 text-xs"
            style={{ 
              backgroundColor: entity.color,
              color: brightness > 0.5 ? '#000' : '#fff' 
            }}>
            {entity.label || 'Entity Preview'}
          </h2>
        </div>
    </div>
  )

}