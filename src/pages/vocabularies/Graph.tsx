import { MultiDirectedGraph } from 'graphology';
import { SigmaContainer } from '@react-sigma/core';

import '@react-sigma/core/lib/react-sigma.min.css';

export const DummyGraph = () => {

  const graph = new MultiDirectedGraph();

  graph.addNode('A', { x: 0, y: 0, label: 'Node A', size: 10 });
  graph.addNode('B', { x: 1, y: 1, label: "Node B", size: 10 });
  graph.addEdgeWithKey('rel1', 'A', 'B', { label: 'REL_1' });

  return (
    <SigmaContainer 
      className="border rounded-md mt-6"
      style={{ height: '500px', padding: '40px' }} 
      graph={graph}>
    </SigmaContainer>
  )

}