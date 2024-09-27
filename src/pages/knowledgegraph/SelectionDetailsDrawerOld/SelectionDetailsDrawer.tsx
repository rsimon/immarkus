import { NodeObject } from 'react-force-graph-2d';
import { Folder } from '@/model';
import { useStore } from '@/store';
import { EntityTypeDetails } from './EntityTypeDetails';
import { FolderDetails } from './FolderDetails';
import { ImageDetails } from './ImageDetails';
import { Graph, GraphNode, KnowledgeGraphSettings } from '../Types';

interface SelectionDetailsDrawerProps {

  graph: Graph;

  // relations: RelationGraph;

  selected: NodeObject<GraphNode>;

  settings: KnowledgeGraphSettings;

  skipInitialAnimation?: boolean;

  onClose(): void;

}

export const SelectionDetailsDrawer = (props: SelectionDetailsDrawerProps) => {

  const store = useStore();

  return null /* (
    <Drawer
      className="bg-white/80 backdrop-blur-sm shadow"
      data={props.selected}
      skipInitialAnimation={props.skipInitialAnimation}
      onClose={props.onClose}
      content={selected => selected.type === 'ENTITY_TYPE' ? (
        <EntityTypeDetails 
          graph={props.graph}
          // relations={props.relations}
          settings={props.settings}
          type={store.getDataModel().getEntityType(selected.id)} />
      ) : selected.type === 'IMAGE' ? (
        <ImageDetails
          image={store.getImage(selected.id)} 
          // relations={props.relations} 
          />
      ) : (
        <FolderDetails
          folder={store.getFolder(selected.id) as Folder} />
      )} />
  ) */

}