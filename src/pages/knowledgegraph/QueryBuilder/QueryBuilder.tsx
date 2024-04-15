import { useRef, useState } from 'react';
import { Grip, Plus } from 'lucide-react';
import { useDraggable } from '@neodrag/react';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { BuildStep } from './BuildStep';
import { buildState } from './createConditionBuildState';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface QueryBuilderProps {

}

export const QueryBuilder = (props: QueryBuilderProps) => {

  const el = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const store = useStore();

  const datamodel = store.getDataModel();

  const [state, setState] = useState<BuildStep[]>(buildState());

	useDraggable(el, {
    position,
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
  });

  return (
    <div 
      ref={el}
      className="bg-white/90 backdrop-blur-sm border absolute bottom-16 left-7 rounded shadow-lg z-30">
      <div className="px-3 pt-2.5 pb-3 cursor-move">
        <div className="mb-4 text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Grip className="w-4 h-4" />

          <span>Query Builder</span>
        </div>

        <div className="text-xs flex items-center gap-2 pt-2">
          {state.map(step => (
            <Select defaultValue={step.options[0]}>
              <SelectTrigger className="flex-grow whitespace-nowrap overflow-hidden">
                <span className="overflow-hidden text-ellipsis text-xs">
                  <SelectValue />
                </span>
              </SelectTrigger>

              <SelectContent>
                {step.options.map(option => (
                  <SelectItem key={option} className="text-xs" value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

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