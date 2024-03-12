import { GraphNode } from '../Types';

interface SelectionDetailsProps {

  selected: GraphNode;

}

export const SelectionDetails = (props: SelectionDetailsProps) => {

  return (
    <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-sm rounded p-4 shadow-sm border">
      {props.selected.id} ({props.selected.type})
    </div>
  )

}