import { Drawer } from '@/components/Drawer';
import { NodeObject } from 'react-force-graph-2d';
import { Graph, GraphNode } from '../Types';
import { EntityTypeDetails } from './EntityTypeDetails';
import { ImageDetails } from './ImageDetails';
import { useStore } from '@/store';

interface SelectionDetailsDrawerProps {

  graph: Graph;

  selected: NodeObject<GraphNode>;

  onClose(): void;

}

export const SelectionDetailsDrawer = (props: SelectionDetailsDrawerProps) => {

  const store = useStore();

  return (
    <Drawer
      className="bg-white/80 backdrop-blur-sm shadow"
      data={props.selected}
      onClose={props.onClose}
      content={selected => selected.type === 'ENTITY_TYPE' ? (
        <EntityTypeDetails 
          graph={props.graph}
          type={store.getDataModel().getEntityType(selected.id)} />
      ) : selected.type === 'IMAGE' ? (
        <ImageDetails
          image={store.getImage(selected.id)} />
      ) : (
        <div></div>
      )} />
  )

}