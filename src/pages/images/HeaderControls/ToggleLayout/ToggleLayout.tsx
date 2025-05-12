import { LayoutGrid, Rows3 } from 'lucide-react';
import { ItemLayout } from '../../Types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger 
} from '@/ui/Select';

interface ToggleLayoutProps {

  layout: ItemLayout;

  onSetLayout(layout: ItemLayout): void;

}

export const ToggleLayout = (props: ToggleLayoutProps) => {

  return (
    <Select 
      value={props.layout}
      onValueChange={props.onSetLayout}>
      <SelectTrigger
        className="text-muted-foreground bg-transparent border-0 shadow-none flex items-center gap-1.5 p-0 h-auto font-normal">
        {props.layout === 'grid' ? (
          <><LayoutGrid className="size-4" /> Grid view</>
        ) : (
          <><Rows3 className="size-4" /> Table view</>
        )}
      </SelectTrigger>
      
      <SelectContent>
        <SelectItem value="grid">Grid view</SelectItem>
        <SelectItem value="table">Table view</SelectItem>
      </SelectContent>
    </Select>
  )

}