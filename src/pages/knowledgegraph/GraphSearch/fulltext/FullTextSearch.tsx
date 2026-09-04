import { ChevronRight } from 'lucide-react';
import { Input } from '@/ui/Input';

interface FulltextSearchProps {

  onGoToBuilder(): void;

}

export const FulltextSearch = (props: FulltextSearchProps) => {

  return (
    <div className="px-4 py-4">
      <Input 
        placeholder="Search annotations and metadata..." />

      <div className="mt-2 flex justify-end">
        <button 
          className="flex items-center text-[11.5px] text-muted-foreground gap-0.5 mr-0.5 hover:underline hover:text-black "
          onClick={props.onGoToBuilder}>
          <ChevronRight className="h-3 w-3" /> Use query builder
        </button>
      </div>
    </div>
  )
  
}