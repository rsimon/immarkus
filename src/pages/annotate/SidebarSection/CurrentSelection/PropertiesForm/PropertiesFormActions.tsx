import { Button } from '@/ui/Button';
import { Cuboid, NotebookPen, X } from 'lucide-react';

interface PropertiesFormActionsProps {

  hasNote: boolean;

  onAddTag(): void;

  onAddNote(): void;

  onClearNote(): void;
  
}

export const PropertiesFormActions = (props: PropertiesFormActionsProps) => {
  
  return (
    <div className="py-2 flex gap-1 justify-between text-muted-foreground mb-4">
      <Button 
        variant="ghost" 
        type="button"
        className="text-xs pl-2 pr-2.5 font-normal py-3.5 h-6 rounded-full whitespace-nowrap"
        onClick={props.onAddTag}>
        <Cuboid className="h-3.5 w-3.5 mr-1.5" /> Add Tag
      </Button>

      {props.hasNote ? (
        <Button 
          variant="ghost" 
          type="button"
          className="text-xs pl-2 pr-2.5 font-normal py-3.5 h-6 rounded-full whitespace-nowrap"
          onClick={props.onClearNote}>
          <X className="h-3.5 w-3.5 mr-1" /> Clear Note
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          type="button"
          className="text-xs pl-2 pr-2.5 py-3.5 h-6 font-normal rounded-full whitespace-nowrap"
          onClick={props.onAddNote}>
          <NotebookPen className="h-4 w-4 mr-1" /> Add Note
        </Button>
      )}
    </div>
  )

}