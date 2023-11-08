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

  tool: Tool;

  onToolChange(tool: Tool): void;

}

export const ToolSelector = (props: ToolSelectorProps) => {

  return (
    <Select value={props.tool} onValueChange={props.onToolChange}>
      <SelectTrigger className="pl-2.5 min-w-[120px] py-2 pr-2 flex items-center text-xs rounded-md hover:bg-muted border shadow-sm">
        <SelectValue className="pr-4" />
      </SelectTrigger>

      <SelectContent className="tool-dropdown">
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