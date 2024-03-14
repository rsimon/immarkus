import { useStore } from '@/store';
import { GraphNode } from '../Types';
import { EntityTypeDetails } from './EntityTypeDetails';
import { ImageDetails } from './ImageDetails';
import { Button } from '@/ui/Button';
import { X } from 'lucide-react';

interface SelectionDetailsProps {

  selected: GraphNode;

}

export const SelectionDetails = (props: SelectionDetailsProps) => {

  const { id, type } = props.selected;

  const store = useStore();

  return (
    <div className="absolute top-8 right-8 w-[300px] bg-white/80 backdrop-blur-sm rounded shadow border">
      {type === 'ENTITY_TYPE' ? (
        <EntityTypeDetails 
          type={store.getDataModel().getEntityType(id)} />
      ) : (
        <ImageDetails
          image={store.getImage(id)} />
      )}
    </div>
  )

}