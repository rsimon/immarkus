import { useRef, useState } from 'react';
import { Grip, Plus } from 'lucide-react';
import { useDraggable } from '@neodrag/react';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';
import { Separator } from '@/ui/Separator';

interface QueryBuilderProps {

}

export const QueryBuilder = (props: QueryBuilderProps) => {

  const el = useRef(null);

  const store = useStore();

  const [position, setPosition] = useState({ x: 0, y: 0 });

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
          <Select defaultValue="all">
            <SelectTrigger className="flex-grow whitespace-nowrap overflow-hidden">
              <span className="overflow-hidden text-ellipsis text-xs">
                <SelectValue />
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem className="text-xs" value="all">All nodes</SelectItem>
              <SelectItem value="entityTypes">Entity classes</SelectItem>
              <SelectItem value="images">All Images</SelectItem>
              <SelectItem value="folders">Folders</SelectItem>
            </SelectContent>
          </Select>

          <span>where</span>

          <Select defaultValue="all">
            <SelectTrigger className="flex-grow whitespace-nowrap overflow-hidden">
              <span className="overflow-hidden text-ellipsis text-xs">
                <SelectValue />
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Material</SelectItem>
              <SelectItem value="entityTypes">Entity classes</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="folders">Folders</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="flex-grow whitespace-nowrap overflow-hidden">
              <span className="overflow-hidden text-ellipsis">
                <SelectValue />
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="is_defined">is defined</SelectItem>
              <SelectItem value="is">is</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="flex-grow whitespace-nowrap overflow-hidden">
              <span className="overflow-hidden text-ellipsis">
                <SelectValue />
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="wood">Wood</SelectItem>
            </SelectContent>
          </Select>.
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