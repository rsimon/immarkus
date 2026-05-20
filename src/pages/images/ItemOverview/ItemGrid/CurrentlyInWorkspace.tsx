import { PanelsTopLeft } from 'lucide-react';
import { useAnnotationViewState } from '@/pages/annotate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';

interface CurrentlyInWorkspaceProps {

  imageId: string;

}

export const CurrentlyInWorkspace = (props: CurrentlyInWorkspaceProps) => {

  const {imageIds } = useAnnotationViewState();
  
  const isInWorkspace = imageIds.includes(props.imageId);

  return isInWorkspace ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="absolute top-2 right-2 bg-green-500 p-1 text-white rounded">
          <PanelsTopLeft className="size-4" />
        </div>
      </TooltipTrigger>

      <TooltipContent>
        Currently open in workspace
      </TooltipContent>
    </Tooltip>
  ) : null;

}