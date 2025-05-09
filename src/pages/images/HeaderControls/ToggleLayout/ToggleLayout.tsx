import { ChevronDown, LayoutGrid } from 'lucide-react';
import { Button } from '@/ui/Button';

export const ToggleLayout = () => {

  return (
    <div>
      <LayoutGrid className="size-4.5" /> 
      <Button 
        variant="link"
        className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal">
        Show as grid 
      </Button>
      <ChevronDown className="size-3.5" />
    </div>
  )

}