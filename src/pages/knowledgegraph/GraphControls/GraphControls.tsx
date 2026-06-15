import { Fullscreen, PinOff, Search, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TooltippedButton } from '@/components/TooltippedButton';

interface GraphControlsProps {

  hasPinnedNodes: boolean;

  isFullScreen: boolean;

  isSearchOpen: boolean;

  isSettingsOpen: boolean;

  onToggleFullscreen(): void;

  onToggleSearch(): void;

  onToggleSettings(): void;

  onUnpinAllNodes(): void;
 
}

export const GraphControls = (props: GraphControlsProps) => {

  const { t } = useTranslation('knowledgegraph');

  return (
    <>
      <div className="absolute top-6 right-6 flex gap-2.5">
        <TooltippedButton 
          size="icon"
          variant={props.isFullScreen ? undefined : 'outline'}
          className={props.isFullScreen 
            ? 'rounded-full bg-black'
            : 'rounded-full bg-white/70 backdrop-blur-xs'}
          tooltip={t('graphControls.toggleFullscreen')}
          onClick={props.onToggleFullscreen}>
          <Fullscreen className="h-5 w-5" />
        </TooltippedButton>
      </div>
      
      <div className="absolute bottom-6 right-6 flex gap-2.5">
        {props.hasPinnedNodes && (
          <TooltippedButton
            size="icon"
            className="rounded-full"
            tooltip={t('graphControls.unpinAllNodes')}
            onClick={props.onUnpinAllNodes}>
            <PinOff className="h-5 w-5" />
          </TooltippedButton>
        )}

        <TooltippedButton
          size="icon"
          variant={props.isSearchOpen ? undefined : 'outline'}
          className={props.isSearchOpen 
            ? 'rounded-full bg-black'
            : 'rounded-full bg-white/70 backdrop-blur-xs'}
          tooltip={t('graphControls.graphSearch')}
          onClick={props.onToggleSearch}>
          <Search className="h-5 w-5" />
        </TooltippedButton>

        <TooltippedButton 
          variant={props.isSettingsOpen ? undefined : 'outline'}
          className={props.isSettingsOpen 
            ? 'gap-2 pl-3.5 pr-4 rounded-full border'
            : 'gap-2 pl-3.5 pr-4 rounded-full bg-white/70 backdrop-blur-xs'}
          tooltip={t('graphControls.graphSettings')}
          onClick={props.onToggleSettings}>
          <Settings className="h-5 w-5" /> {t('graphControls.settings')}
        </TooltippedButton>
      </div>
    </>
  )

}