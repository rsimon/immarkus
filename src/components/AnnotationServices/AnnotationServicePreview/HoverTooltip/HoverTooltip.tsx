import { useMemo } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { useDataModel } from '@/store';

interface HoverTooltipProps {

  annotation: ImageAnnotation;

}

export const HoverTooltip = (props: HoverTooltipProps) => {
  const { bodies } = props.annotation;
  
  const model = useDataModel();

  const transcription = useMemo(() => {
    const comment = bodies.find(b => (b.purpose === 'commenting' || !b.purpose) && b.value);
    return comment ? comment.value! : undefined;
  }, [bodies]);

  const entityCounts = useMemo(() => {
    const entityBodies = bodies.filter(b => b.purpose === 'classifying');
    return Object.entries(entityBodies.reduce<Record<string, number>>((all, body) => {
      if ('source' in body && typeof body.source === 'string') {
        const count = all[body.source] || 0;
        all[body.source] = count + 1;
      }

      return all;
    }, {}));
  }, [bodies]);

  const renderEntityBadge = (id: string, count: number) => {
    const entityType = model.getEntityType(id);

    return (
      <li 
        key={id}
        className="text-[11px] flex gap-1 items-center bg-muted/90 whitespace-nowrap rounded-full pl-1.5 pr-2 py-0.5 border">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
          style={{ backgroundColor: entityType?.color }}/>
        <span>{entityType?.label || id}</span>
        <span>{count}</span>
      </li>
    )

  }

  return transcription ? (
    <div className="bg-white p-2 shadow-md rounded-md z-30">
      <div>
        {transcription}
      </div>

      {entityCounts.length > 0 && (
        <ul className="flex pt-2">
          {entityCounts.map(([id, count]) => renderEntityBadge(id, count))}
        </ul>
      )}
    </div>
  ) : null;

}