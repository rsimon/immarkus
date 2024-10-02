import { NodeObject } from 'react-force-graph-2d';
import { Drawer } from '@/components/Drawer';
import { useStore } from '@/store';
import { Graph, GraphNode, KnowledgeGraphSettings } from '../Types';
import { SelectedEntityType } from './SelectedEntityType';
import { SelectedImage } from './SelectedImage';
import { SelectedFolder } from './SelectedFolder';
import { Folder } from '@/model';

interface SelectionDetailsDrawerProps {

  graph: Graph;

  selected: NodeObject<GraphNode>;

  settings: KnowledgeGraphSettings;

  skipInitialAnimation?: boolean;

  onClose(): void;

}

export const SelectionDetailsDrawer = (props: SelectionDetailsDrawerProps) => {

  const store = useStore();

  return (
    <Drawer
      open={Boolean(props.selected)}
      className="bg-muted"
      skipInitialAnimation={props.skipInitialAnimation}
      onClose={props.onClose}>
      {props.selected?.type === 'ENTITY_TYPE' ? (
        <SelectedEntityType 
          graph={props.graph}
          settings={props.settings}
          type={store.getDataModel().getEntityType(props.selected.id)} 
          onClose={props.onClose} />
      ) : props.selected?.type === 'IMAGE' ? (
        <SelectedImage 
          image={store.getImage(props.selected.id)}
          settings={props.settings}
          onClose={props.onClose} />
      ) : props.selected?.type === 'FOLDER' && (
        <SelectedFolder 
          folder={store.getFolder(props.selected.id) as Folder} 
          onClose={props.onClose} />
      )}
    </Drawer>
  )

}