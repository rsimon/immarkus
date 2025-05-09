import { Button } from '@/ui/Button';
import { ArrowDownUp, ChevronDown } from 'lucide-react';

export const SetOrder = () => {

  return (
    <div>
      <ArrowDownUp className="size-4" />
      <Button 
        variant="link"
        className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal">
        Sort 
      </Button>
      <ChevronDown className="size-3.5" />
    </div>
  )

}