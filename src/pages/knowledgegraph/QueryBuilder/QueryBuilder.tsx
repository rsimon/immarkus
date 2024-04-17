import { useEffect, useRef, useState } from 'react';
import { Grip, Plus } from 'lucide-react';
import { useDraggable } from '@neodrag/react';
import { Button } from '@/ui/Button';
import { QueryConditionBuilder } from './QueryConditionBuilder';
import { ConditionQuery } from './Types';
import { GraphNode } from '../Types';
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

  const [typeFilter, setTypeFilter] = useState<GraphNode['type'] | undefined>();

  const [conditions, setConditions] = useState<(ConditionQuery | undefined)[]>([]);

  useDraggable(el, {
    position,
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
  });

  useEffect(() => {
    setConditions([]);
  }, [typeFilter]);

  useEffect(() => {
    const filtered = conditions.filter(Boolean);

    const query = typeFilter
      ? (n: GraphNode) => [
          (n: GraphNode) => n.type === typeFilter,
          ...filtered
        ].every(condition => condition(n))

      : (n: GraphNode) => filtered.every(condition => condition(n));

    props.onChangeQuery(query);
  }, [typeFilter, conditions]);

  return (
    <div 
      ref={el}
      className="bg-white min-w-[510px] min-h-[180px] backdrop-blur-sm border absolute bottom-16 left-7 rounded shadow-lg z-30">
    
      <div className="p-2 border-b cursor-move mb-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1">
          <Grip className="w-4 h-4" />
          <span>Query Builder</span>
        </div>
      </div>

      <div className="p-2 pr-6">
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
              <SelectItem className="text-xs" value="ENTITY_TYPE">entity classes</SelectItem>
              <SelectItem className="text-xs" value="FOLDER">folders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {conditions.length > 0 ? conditions.map((_, idx) => (
          <QueryConditionBuilder 
            key={idx}
            isFirstCondition={idx === 0}
            typeFilter={typeFilter}
            onChangeQuery={next => setConditions(queries => queries.map((q, i) => i === idx ? next : q))}
            onDelete={() => setConditions(queries => 
              ([...queries.slice(0, idx), ...queries.slice(idx + 1)]))} />
        )) : (
          <div className="text-xs text-muted-foreground px-3.5 pt-3 pb-1.5">
            No filter conditions are applied
          </div>
        )}

        <div className="flex justify-end pt-1 px-2">
          <Button 
            disabled={conditions.length > 0}
            variant="link"
            size="sm"
            className="flex items-center text-xs py-0 px-0"
            onClick={() => setConditions(conditions => ([...conditions, undefined]))}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Condition
          </Button>
        </div>
      </div>
    </div>
  )

}