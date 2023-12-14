import { useState } from 'react';
import { X } from 'lucide-react';
import { EntityType } from '@/model';
import { getForegroundColor } from '@/utils/color';

interface BadgeEntityProps {

  entityType?: EntityType;

  onDelete?(): void;

}

const DEFAULT_COLOR = '#c2c2c2';

export const EntityBadge = (props: BadgeEntityProps) => {

  const { entityType } = props;

  const backgroundColor = entityType?.color || DEFAULT_COLOR;

  const [editable, setEditable] = useState(false);

  return (
    <span 
      onClick={props.onDelete ? () => setEditable(editable => !editable) : undefined}
      className="rounded-full px-2.5 py-1 inline-flex items-center text-xs h-6 cursor-pointer"
      style={{ 
        backgroundColor,
        color: getForegroundColor(backgroundColor)
      }}>
      {entityType?.label || 'error'}

      {editable && (
        <button 
          className="ml-1 -mr-1"
          onClick={props.onDelete}>
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  )

}