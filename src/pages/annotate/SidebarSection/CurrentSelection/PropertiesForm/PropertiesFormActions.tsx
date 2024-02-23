import { Button } from '@/ui/Button';
import { Cuboid, NotebookPen, PlusCircle } from 'lucide-react';

interface PropertiesFormActionsProps {

  onAddTag(): void;
  
}

export const PropertiesFormActions = (props: PropertiesFormActionsProps) => {

  const onAddNote = () => {

  }
  
  return (
    <div className="py-3 flex justify-end gap-2 text-muted-foreground">
      <Button 
        variant="ghost" 
        type="button"
        className="text-xs pl-2 pr-2.5 py-3.5 h-6 font-normal rounded-full whitespace-nowrap"
        onClick={props.onAddTag}>
        <Cuboid className="h-4 w-4 mr-1.5" /> Add Tag
      </Button>

      <Button 
        variant="ghost" 
        type="button"
        className="text-xs pl-2 pr-2.5 py-3.5 h-6 font-normal rounded-full whitespace-nowrap"
        onClick={onAddNote}>
        <NotebookPen className="h-4 w-4 mr-1" /> Add Note
      </Button>
    </div>
  )

}