import { PanelsTopLeft, SquareArrowOutUpRight } from 'lucide-react';
import { useOpenInAnnotationView } from '@/pages/annotate';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
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
  
  const { imageIds, openInAnnotationView, addToAnnotationView } = useOpenInAnnotationView();

  const isOpen = imageIds.includes(props.id);

  return isOpen ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="bg-green-500 self-start p-1 mt-px ml-1.5 text-white rounded">
          <PanelsTopLeft className="size-4" />
        </div>
      </TooltipTrigger>

      <TooltipContent>
        Currently open in workspace
      </TooltipContent>
    </Tooltip>
  ) : (
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