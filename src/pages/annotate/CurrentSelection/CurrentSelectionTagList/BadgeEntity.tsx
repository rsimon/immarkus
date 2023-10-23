import { useState } from 'react';
import { X } from 'lucide-react';
import { Entity } from '@/model';
import { getForegroundColor } from '@/components/EntityDetails';

interface BadgeEntityProps {

  entity?: Entity;

  onDelete(): void;

}

const DEFAULT_COLOR = '#c2c2c2';

export const BadgeEntity = (props: BadgeEntityProps) => {

  const { entity } = props;

  const backgroundColor = entity?.color || DEFAULT_COLOR;

  const [editable, setEditable] = useState(false);

  return (
    <span 
      onClick={() => setEditable(editable => !editable)}
      className="rounded-full px-2.5 py-1 inline-flex items-center text-xs h-6 cursor-pointer"
      style={{ 
        backgroundColor,
        color: getForegroundColor(backgroundColor)
      }}>
      {entity?.label || 'error'}

      {editable && (
        <button 
          className="ml-1 -mr-0.5"
          onClick={props.onDelete}>
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  )

}