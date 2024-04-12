import { useStore } from '@/store';
import { Graph, GraphNode } from '../Types';
import { EntityTypeDetails } from './EntityTypeDetails/EntityTypeDetails';
import { ImageDetails } from './ImageDetails/ImageDetails';

interface SelectionDetailsProps {

  graph: Graph;

  selected: GraphNode;

}

export const SelectionDetails = (props: SelectionDetailsProps) => {

  const { id, type } = props.selected;

  const store = useStore();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-md shadow border pointer-events-auto">
      {type === 'ENTITY_TYPE' ? (
        <EntityTypeDetails 
          graph={props.graph}
          type={store.getDataModel().getEntityType(id)} />
      ) : (
        <ImageDetails
          image={store.getImage(id)} />
      )}
    </div>
  )

}