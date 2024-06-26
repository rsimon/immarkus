import { NodeObject } from 'react-force-graph-2d';
import { Drawer } from '@/components/Drawer';
import { Folder } from '@/model';
import { useStore } from '@/store';
import { EntityTypeDetails } from './EntityTypeDetails';
import { FolderDetails } from './FolderDetails';
import { ImageDetails } from './ImageDetails';
import { Graph, GraphNode } from '../Types';

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
        <FolderDetails
          folder={store.getFolder(selected.id) as Folder} />
      )} />
  )

}