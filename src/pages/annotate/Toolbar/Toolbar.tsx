import { Ellipse, Polygon, Rectangle } from '@/components/Icons';
import { Toggle } from '@/ui/Toggle';

import './Toolbar.css';

interface ToolbarProps {

  tool: Tool;

  onToolChange(tool: Tool): void;

}

export type Tool = 'rectangle' | 'polygon' | 'ellipse';

export const Toolbar = (props: ToolbarProps) => {

  return (
    <div className="bg-white p-1.5 shadow-md rounded-lg border-t border-l pointer-events-auto flex">
      <Toggle 
        className="pl-2 pr-3"
        pressed={props.tool === 'rectangle'}
        onPressedChange={() => props.onToolChange('rectangle')}>
        <Rectangle className="ia-tool" /> Box
      </Toggle>

      <Toggle   
        className="ml-2"
        pressed={props.tool === 'polygon'}
        onPressedChange={() => props.onToolChange('polygon')}>
        <Polygon className="ia-tool" /> Polygon
      </Toggle>

      <Toggle   
        className="ml-2"
        pressed={props.tool === 'ellipse'}
        onPressedChange={() => props.onToolChange('ellipse')}>
        <Ellipse className="ia-tool" /> Ellipse
      </Toggle>
    </div>
  )

}