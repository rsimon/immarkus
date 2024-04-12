import { TooltippedButton } from "@/components/TooltippedButton";
import { Button } from "@/ui/Button";
import { Fullscreen, Maximize, PinOff, Settings } from "lucide-react";

interface ControlsProps {

  hasPinnedNodes: boolean;

  isFullScreen: boolean;

  onToggleFullscreen(): void;

  onToggleSettings(): void;

  onUnpinAllNodes(): void;

  settingsOpen: boolean;

}

export const Controls = (props: ControlsProps) => {

  return (
    <div className="absolute bottom-6 right-7 flex gap-2.5">
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
        variant="outline"
        className="rounded-full bg-white/70 backdrop-blur-sm"
        tooltip="Fullscreen">
        <Fullscreen className="h-5 w-5" />
      </TooltippedButton>

      <TooltippedButton 
        variant="outline"
        className="gap-2 pl-3.5 pr-4 rounded-full bg-white/70 backdrop-blur-sm"
        tooltip="View and filter settings">
        <Settings className="h-5 w-5" /> Settings
      </TooltippedButton>
    </div>
  )

}