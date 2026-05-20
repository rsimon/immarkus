import { useAnnotationViewState } from '@/pages/annotate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';

interface IsInWorkspacePipProps {

  imageId: string;

}

export const IsInWorkspacePip = (props: IsInWorkspacePipProps) => {

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