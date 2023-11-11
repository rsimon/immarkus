import { Circle, Square, TriangleRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

export type Tool = 'rectangle' | 'polygon' | 'ellipse';

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
          className="pl-2 py-2 pr-1.5 hover:bg-slate-200 rounded-l-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <SelectValue className="pr-0" />
        </button>        
        
        <SelectTrigger className="tool-dropdown-trigger rounded-l-none border-none bg-transparent 
          pl-0.5 pr-1.5 hover:bg-slate-200 focus:outline-none focus:ring-0 focus:ring-ring focus:ring-offset-0" />
      </div>

      <SelectContent
        align="end" 
        className="tool-dropdown">
        <SelectItem value="rectangle">
          <div className="flex items-center text-xs">
            <Square className="w-3.5 h-3.5 mr-1 mb-[1px]" /> Rectangle
          </div>
        </SelectItem>

        <SelectItem value="polygon">
          <div className="flex items-center text-xs">
            <TriangleRight className="w-3.5 h-3.5 mr-1 -rotate-[10deg]" /> Polygon
          </div>
        </SelectItem>

        <SelectItem value="ellipse" >
          <div className="flex items-center text-xs">
            <Circle className="w-3.5 h-3.5 mr-1 scale-y-90 mb-[1px]" /> Ellipse
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )

}