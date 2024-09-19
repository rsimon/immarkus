import { Circle, Square, TriangleRight } from 'lucide-react';
import { Tool } from '../Tool';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface ToolSelectorProps {

  active: boolean;

  tool: Tool;

  onClick(): void;

  onToolChange(tool: Tool): void;

}

export const ToolSelector = (props: ToolSelectorProps) => {

  return (
    <Select value={props.tool} onValueChange={props.onToolChange}>
      <div 
        role="button"
        data-state={props.active ? 'active' : undefined}
        aria-selected={props.active}
        className="flex items-center text-xs rounded-md hover:bg-muted">
        
        <button 
          onClick={props.onClick}
          className="pl-2 py-2 pr-[5px] hover:bg-slate-200/70 rounded-l-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <SelectValue className="pr-0" />
        </button>        
        
        <SelectTrigger 
          className="tool-dropdown-trigger rounded-l-none bg-transparent border-t-0 border-r-0 border-b-0 
            border-l-1 border-white/30 pl-[1px] pr-1 hover:bg-slate-200 focus:outline-none focus:ring-0 
            focus:ring-ring focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
            focus-visible:ring-offset-2 shadow-none" />
      </div>

      <SelectContent
        align="end" 
        alignOffset={-14}
        className="tool-dropdown">
        <SelectItem value="rectangle">
          <div className="flex items-center text-xs">
            <Square className="w-3.5 h-3.5 mr-2 mb-[1px]" /> Rectangle
          </div>
        </SelectItem>

        <SelectItem value="polygon">
          <div className="flex items-center text-xs">
            <TriangleRight className="w-3.5 h-3.5 mr-2 -rotate-[10deg]" /> Polygon
          </div>
        </SelectItem>

        <SelectItem value="ellipse" >
          <div className="flex items-center text-xs">
            <Circle className="w-3.5 h-3.5 mr-2 scale-y-90 mb-[1px]" /> Ellipse
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )

}