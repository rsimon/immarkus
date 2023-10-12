import { Polygon, Rectangle } from '@/components/Icons';
import { Toggle } from '@/ui/Toggle';

interface ToolbarProps {

  tool: Tool;

  onToolChange(tool: Tool): void;

}

export type Tool = 'rectangle' | 'polygon' | 'ellipse';

export const Toolbar = (props: ToolbarProps) => {

  return (
    <div className="mt-8 mb-2">
      <Toggle 
        pressed={props.tool === 'rectangle'}
        onPressedChange={() => props.onToolChange('rectangle')}>
        <Rectangle className="ia-tool" /> Box
      </Toggle>

      <Toggle   
        className="ml-2"
        pressed={props.tool === 'polygon'}
        onPressedChange={() => props.onToolChange('polygon')}>
        <Polygon className="ia-too" /> Polygon
      </Toggle>

      <Toggle   
        className="ml-2"
        pressed={props.tool === 'ellipse'}
        onPressedChange={() => props.onToolChange('ellipse')}>
        <Polygon className="ia-too" /> Ellipse
      </Toggle>
    </div>
  )

}