import { useMemo } from 'react';
import { Circle, Square, Tangent, TriangleRight } from 'lucide-react';
import { AnnotationMode, Tool } from '../AnnotationMode';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface ToolSelectorProps {

  compact?: boolean;

  mode: AnnotationMode;

  tool: Tool;

  onToolChange(tool: Tool): void;

}

const TOOLS = new Set(['rectangle', 'polygon', 'ellipse']);

export const ToolSelector = (props: ToolSelectorProps) => {

  const tool = useMemo(() => {
    return (TOOLS.has(props.tool)) ? props.tool : 'rectangle';
  }, [props.tool]);

  const active = useMemo(() => {
    if (props.mode !== 'draw') return false;
    return TOOLS.has(props.tool);
  }, [props.tool, props.mode]);

  const onClick = () => {
    if (TOOLS.has(tool)) {
      props.onToolChange(tool);
    } else {
      props.onToolChange('rectangle');
    }
  }

  return (
    <Select value={tool} onValueChange={props.onToolChange}>
      <div 
        role="button"
        data-state={active ? 'active' : undefined}
        aria-selected={active}
        className="flex items-center text-xs rounded-md hover:bg-muted">
        
        <button 
          onClick={onClick}
          className="pl-2 h-auto py-1.5 pr-[5px] hover:bg-slate-200/70 rounded-l-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <SelectValue className="pr-0" />
        </button>        
        
        <SelectTrigger 
          className="tool-dropdown-trigger rounded-l-none bg-transparent border-t-0 border-r-0 border-b-0 
            border-l-1 border-white/30 h-auto py-1.5 pl-[1px] pr-1 hover:bg-slate-200 focus:outline-hidden focus:ring-0 
            focus:ring-ring focus:ring-offset-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring 
            focus-visible:ring-offset-2 shadow-none" />
      </div>

      <SelectContent
        align="end" 
        alignOffset={-14}
        className="tool-dropdown min-w-0">
        <SelectItem value="rectangle">
          <div className="flex items-center text-xs gap-1.5">
            <Square className="w-3.5 h-3.5 mb-[1px]" /> 
            {!props.compact && (<>Box</>)}
          </div>
        </SelectItem>

        <SelectItem value="polygon">
          <div className="flex items-center text-xs gap-1.5">
            <TriangleRight className="w-3.5 h-3.5 -rotate-[10deg]" /> 
            {!props.compact && (<>Polygon</>)}
          </div>
        </SelectItem>

        <SelectItem value="ellipse" >
          <div className="flex items-center text-xs gap-1.5">
            <Circle className="w-3.5 h-3.5 scale-y-90 mb-[1px]" />
            {!props.compact && (<>Ellipse</>)}
          </div>
        </SelectItem>

        <SelectItem value="path">
          <div className="flex items-center text-xs gap-1.5">
            <Tangent className="w-3.5 h-3.5 scale-y-90 mb-[1px]" />
            {!props.compact && (<>Path</>)}
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )

}