import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';

interface FulltextSearchProps {

  onGoToBuilder(): void;

}

export const FulltextSearch = (props: FulltextSearchProps) => {

  return (
    <div className="px-4 py-4">
        <Input 
          placeholder="Search annotations and metadata..." />

      <div className="mt-1.5">
        <Button 
          variant="link"
          className="text-xs p-1 h-auto font-normal text-muted-foreground/70 hover:text-foreground"
          onClick={props.onGoToBuilder}>
          Query builder
        </Button>
      </div>
    </div>
  )
  
}