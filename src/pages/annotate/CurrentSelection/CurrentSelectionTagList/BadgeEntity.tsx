import { Entity } from '@/model';
import { getForegroundColor } from '@/components/EntityDetails';

interface BadgeEntityProps {

  entity?: Entity;

}

const DEFAULT_COLOR = '#c2c2c2';

export const BadgeEntity = (props: BadgeEntityProps) => {

  const { entity } = props;

  const backgroundColor = entity?.color || DEFAULT_COLOR;

  return (
    <span 
      className="rounded-full px-2.5 py-1 inline-flex items-center text-xs h-6"
      style={{ 
        backgroundColor,
        color: getForegroundColor(backgroundColor)
      }}>
      {entity?.label || 'error'}
    </span>
  )

}