import { useAnnotator } from '@annotorious/react';
import { Ellipse, Polygon, Rectangle } from '@/components/Icons';
import { Toggle } from '@/ui/Toggle';

import './Toolbar.css';

interface ToolbarProps {

  tool: Tool;

  onToolChange(tool: Tool): void;

}

export type Tool = 'rectangle' | 'polygon' | 'ellipse';

export const Toolbar = (props: ToolbarProps) => {

  const anno = useAnnotator();

  const onToolChange = (tool: Tool) => () => {
    anno.setSelected();
    props.onToolChange(tool);
  }

  return (
    <div className="bg-white p-1.5 shadow-md rounded-lg border-t border-l pointer-events-auto flex">
      <Toggle 
        className="pl-2 pr-3"
        pressed={props.tool === 'rectangle'}
        onPressedChange={onToolChange('rectangle')}>
        <Rectangle className="ia-tool" /> Box
      </Toggle>

      <Toggle   
        className="ml-2"
        pressed={props.tool === 'polygon'}
        onPressedChange={onToolChange('polygon')}>
        <Polygon className="ia-tool" /> Polygon
      </Toggle>

      <Toggle   
        className="ml-2"
        pressed={props.tool === 'ellipse'}
        onPressedChange={onToolChange('ellipse')}>
        <Ellipse className="ia-tool" /> Ellipse
      </Toggle>
    </div>
  )

}