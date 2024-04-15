import { Drawer } from '@/components/Drawer';
import { NodeObject } from 'react-force-graph-2d';
import { Graph, GraphNode } from '../Types';

interface DetailsDrawerProps {

  graph: Graph;

  selected: NodeObject<GraphNode>;

  onClose(): void;

}

export const DetailsDrawer = (props: DetailsDrawerProps) => {

  return (
    <Drawer
      onClose={props.onClose}
      data={props.selected}
      content={selected => (
        <div>Foo</div>
      )} />
  )

}