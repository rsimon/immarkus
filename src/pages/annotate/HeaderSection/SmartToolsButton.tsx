import { WandSparkles } from 'lucide-react';
import { ToolbarButton } from '../ToolbarButton';
import { BorderBeam } from '@/ui/BorderBeam';

interface SmartToolsButtonProps {

  isSmartPanelOpen: boolean;

  onClick(): void;

}

export const SmartToolsButton = (props: SmartToolsButtonProps) => {

  return (     
    <ToolbarButton
      onClick={props.onClick}
      data-state={props.isSmartPanelOpen ? 'active' : undefined}
      tooltip="Smart annotation tools"
      className="group overflow-hidden relative text-orange-600/70 flex items-center rounded-md hover:bg-orange-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:bg-orange-50">
      <WandSparkles className="size-4 h-8 w-8 p-2" />
      <BorderBeam className="opacity-0 group-data-[state=active]:opacity-50 group-hover:opacity-50 transition-opacity duration-300" />
    </ToolbarButton>
  )

}