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
        <div className="absolute border border-white -top-0.5 -left-0.75 size-3 bg-green-500 rounded-full" />
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
        <div className="absolute top-2 right-2 bg-green-500 p-1 text-white rounded">
          <PanelsTopLeft className="size-4" />
        </div>
      </TooltipTrigger>

      <TooltipContent>
        {t('workspaceIndicator.currentlyOpen')}
      </TooltipContent>
    </Tooltip>
  ) : null;

}