import { SquareArrowOutUpRight } from 'lucide-react';
import { useOpenInAnnotationView } from '@/pages/annotate';
import { Button } from '@/ui/Button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface AnnotationViewLinkProps {

  id: string;

}

export const AnnotationViewLink = (props: AnnotationViewLinkProps) => {
  
  const { openInAnnotationView, addToAnnotationView } = useOpenInAnnotationView();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-8">
          <SquareArrowOutUpRight className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => openInAnnotationView(props.id)}>
          Open image
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => addToAnnotationView(props.id)}>
          Add to workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}