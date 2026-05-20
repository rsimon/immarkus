import { PanelsTopLeft } from 'lucide-react';
import { useAnnotationViewState } from '@/pages/annotate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';

interface IsInWorkspaceIndicatorPipProps {

  imageId: string;

}

export const IsInWorkspaceIndicatorPip = (props: IsInWorkspaceIndicatorPipProps) => {

  const {imageIds } = useAnnotationViewState();
  
  const isInWorkspace = imageIds.includes(props.imageId);

  return isInWorkspace ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="absolute border border-white -top-0.5 -left-0.75 size-3 bg-green-500 rounded-full" />
      </TooltipTrigger>

      <TooltipContent>
        Currently open in workspace
      </TooltipContent>
    </Tooltip>
  ) : null;

}

interface IsInWorkspaceIndicatorBadgeProps {

  imageId: string;

}

export const IsInWorkspaceIndicatorBadge = (props: IsInWorkspaceIndicatorBadgeProps) => {

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