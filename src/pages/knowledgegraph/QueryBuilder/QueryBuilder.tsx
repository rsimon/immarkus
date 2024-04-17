import { useRef, useState } from 'react';
import { Grip, Plus } from 'lucide-react';
import { useDraggable } from '@neodrag/react';
import { Button } from '@/ui/Button';
import { GraphNode } from '../Types';
import { QueryConditionBuilder } from './QueryConditionBuilder';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface QueryBuilderProps {

  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

}

export const QueryBuilder = (props: QueryBuilderProps) => {

  const el = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [typeFilter, setTypeFilter] = useState<GraphNode['type'] | undefined>()

  useDraggable(el, {
    position,
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
  });

  return (
    <div 
      ref={el}
      className="bg-white backdrop-blur-sm border absolute bottom-16 left-7 rounded shadow-lg z-30">
      <div className="px-3 pt-2.5 pb-3">
        <div className="cursor-move mb-4 text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Grip className="w-4 h-4" />

          <span>Query Builder</span>
        </div>

        <div className="text-xs flex items-center gap-2">
          <span className="w-12 text-right">
            Show
          </span> 
          
          <Select 
            value={typeFilter || 'ALL'}
            onValueChange={value => value === 'ALL' ? 
              setTypeFilter(undefined) : setTypeFilter(value as GraphNode['type'])}>
            
            <SelectTrigger className="rounded-none px-2 py-1 h-auto bg-white shadow-none">
              <span className="text-xs"><SelectValue /></span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem className="text-xs" value="ALL">all nodes</SelectItem>
              <SelectItem className="text-xs" value="IMAGE">images</SelectItem>
              <SelectItem className="text-xs" value="ENTITY_TYPE">entity Classes</SelectItem>
              <SelectItem className="text-xs" value="FOLDER">folders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <QueryConditionBuilder 
          isFirstCondition={true}
          typeFilter={typeFilter}
          onChangeQuery={props.onChangeQuery} />

        <div className="pt-2">
          <Button 
            variant="link"
            size="sm"
            className="flex items-center text-xs py-0 px-1">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Condition
          </Button>
        </div>
      </div>
    </div>
  )

}