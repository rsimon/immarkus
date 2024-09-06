import { Spline } from 'lucide-react';
import { ToolbarButton } from '../../ToolbarButton';

export const ConnectorsToggle = () => {

  return (
    <ToolbarButton className="flex items-center pr-2">
      <Spline
        className="h-8 w-8 p-2" /> Connect
    </ToolbarButton>
  )

}