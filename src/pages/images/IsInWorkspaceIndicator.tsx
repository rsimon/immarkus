import { PanelsTopLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnnotationViewState } from '@/pages/annotate/AnnotationViewState';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';

interface IsInWorkspaceIndicatorPipProps {

  imageId: string;

}

export const IsInWorkspaceIndicatorPip = (props: IsInWorkspaceIndicatorPipProps) => {

  const { t } = useTranslation('images');

  const {imageIds } = useAnnotationViewState();
  
  const isInWorkspace = imageIds.includes(props.imageId);

  return isInWorkspace ? (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="absolute border-2 border-white -top-1.25 -left-1.5 size-4 bg-black rounded-full" />
      </TooltipTrigger>

      <TooltipContent>
        {t('workspaceIndicator.currentlyOpen')}
      </TooltipContent>
    </Tooltip>
  ) : null;

}

interface IsInWorkspaceIndicatorBadgeProps {

  imageId: string;

}

export const IsInWorkspaceIndicatorBadge = (props: IsInWorkspaceIndicatorBadgeProps) => {

  const { t } = useTranslation('images');

  const {imageIds } = useAnnotationViewState();
  
  const isInWorkspace = imageIds.includes(props.imageId);

  return isInWorkspace ? (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="absolute top-1.5 right-1.5 bg-black p-2 text-white rounded-full">
          <PanelsTopLeft className="size-4" />
        </div>
      </TooltipTrigger>

      <TooltipContent>
        {t('workspaceIndicator.currentlyOpen')}
      </TooltipContent>
    </Tooltip>
  ) : null;

}