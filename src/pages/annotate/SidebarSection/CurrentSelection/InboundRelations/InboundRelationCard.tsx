import { Link } from 'react-router-dom';
import { Dot, Minus, MoveLeft } from 'lucide-react';
import { RelatedAnnotation, useStore } from '@/store';
import { EntityBadge } from '@/components/EntityBadge';

interface InboundRelationCardProps {

  related: RelatedAnnotation;

}

export const InboundRelationCard = (props: InboundRelationCardProps) => {

  const { related } = props;

  const store = useStore();

  const model = store.getDataModel();

  return (
    <div>
      <div className="flex gap-1.5 items-center mb-1">
        <Dot className="h-4 w-4" />

        <MoveLeft className="h-4 w-4" />

        <div className="text-xs italic">
          {related.relationName}
        </div>

        <Minus className="h-4 w-4" />

        <div>
          <EntityBadge entityType={model.getEntityType(related.sourceEntityType)} />
        </div>
      </div>

      <div className="max-w-full overflow-hidden">
        <Link 
          to={related.imageId}
          className="ml-6 whitespace-nowrap block max-w-full overflow-hidden text-ellipsis italic text-sky-700 hover:underline">
          {store.getImage(related.imageId).name}
        </Link>
      </div>
    </div>
  )

}