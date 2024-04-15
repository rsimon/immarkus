import { Fullscreen, PinOff, Settings } from 'lucide-react';
import { TooltippedButton } from '@/components/TooltippedButton';

interface GraphControlsProps {

  hasPinnedNodes: boolean;

  isFullScreen: boolean;

  onToggleFullscreen(): void;

  onToggleSettings(): void;

  onUnpinAllNodes(): void;

  settingsOpen: boolean;

}

export const GraphControls = (props: GraphControlsProps) => {

  return (
    <div className="absolute bottom-6 right-6 flex gap-2.5">
      {props.hasPinnedNodes && (
        <TooltippedButton
          size="icon"
          className="rounded-full"
          tooltip="Un-pin all pinned nodes"
          onClick={props.onUnpinAllNodes}>
          <PinOff className="h-5 w-5" />
        </TooltippedButton>
      )}

      <TooltippedButton 
        size="icon"
        variant={props.isFullScreen ? undefined : 'outline'}
        className={props.isFullScreen 
          ? 'rounded-full bg-black '
          : 'rounded-full bg-white/70 backdrop-blur-sm'}
        tooltip="Toggle fullscreen"
        onClick={props.onToggleFullscreen}>
        <Fullscreen className="h-5 w-5" />
      </TooltippedButton>

      <TooltippedButton 
        variant={props.settingsOpen ? undefined : 'outline'}
        className={props.settingsOpen 
          ? 'gap-2 pl-3.5 pr-4 rounded-full border'
          : 'gap-2 pl-3.5 pr-4 rounded-full bg-white/70 backdrop-blur-sm'}
        tooltip="View and filter settings"
        onClick={props.onToggleSettings}>
        <Settings className="h-5 w-5" /> Settings
      </TooltippedButton>
    </div>
  )

}