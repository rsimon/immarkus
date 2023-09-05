import { useState } from 'react';
import { Toggle } from '@/components/Toggle';
import { Polygon, Rectangle } from './Icons';

interface ToolbarProps {

  tool: Tool;

  onToolChange(tool: Tool): void;

}

export type Tool = 'rectangle' | 'polygon';

export const Toolbar = (props: ToolbarProps) => {

  return (
    <div className="mt-8 mb-2">
      <Toggle 
        pressed={props.tool === 'rectangle'}
        onPressedChange={() => props.onToolChange('rectangle')}>
        <Rectangle /> Box
      </Toggle>

      <Toggle   
        className="ml-2"
        pressed={props.tool === 'polygon'}
        onPressedChange={() => props.onToolChange('polygon')}>
        <Polygon /> Polygon
      </Toggle>
    </div>
  )

}