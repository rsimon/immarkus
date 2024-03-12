import { useStore } from '@/store';
import { GraphNode } from '../Types';
import { EntityTypeDetails } from './EntityTypeDetails';
import { ImageDetails } from './ImageDetails';

interface SelectionDetailsProps {

  selected: GraphNode;

}

export const SelectionDetails = (props: SelectionDetailsProps) => {

  const { id, type } = props.selected;

  const store = useStore();

  return (
    <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-sm rounded p-4 shadow-sm border">
      {type === 'ENTITY_CLASS' ? (
        <EntityTypeDetails 
          type={store.getDataModel().getEntityType(id)} />
      ) : (
        <ImageDetails
          image={store.getImage(id)} />
      )}
    </div>
  )

}