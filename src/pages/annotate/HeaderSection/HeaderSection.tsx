import { Link } from 'react-router-dom';
import { ChevronLeft, ImagePlus, MousePointer2 } from 'lucide-react';
import { Image } from '@/model';
import { Tool, ToolSelector } from './ToolSelector';
import { useState } from 'react';
import { Separator } from '@/ui/Separator';
import { Toggle } from '@radix-ui/react-toggle';

interface HeaderSectionProps {

  images: Image[];

}

export const HeaderSection = (props: HeaderSectionProps) => {

  const [tool, setTool] = useState<Tool>('rectangle');

  const [mode, setMode] = useState<'move' | 'draw'>('move');

  return (
    <section className="toolbar border-b p-2 flex justify-between text-sm h-[46px]">
      <section className="toolbar-left flex gap-1 items-center">
        <div className=" flex items-center">
          <Link className="font-semibold inline" to="/images">
            <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </Link>

          <span className="text-xs font-medium mr-2 ml-0.5">
            {props.images.length === 1 ? props.images[0].name : 'Back to Gallery'}
          </span>
        </div>
      </section>

      <section className="toolbar-right flex gap-1.5 items-center">
        <button 
          className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <ImagePlus className="h-4 w-4 mr-1" /> Add image
        </button>

        <Separator orientation="vertical" className="h-4" />

        <Toggle 
          className="p-2 pr-2.5 flex text-xs rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-selected={mode === 'move'}
          data-state={mode === 'move' ? 'active' : undefined}>
          <MousePointer2 className="h-4 w-4 mr-1" /> Move
        </Toggle>

        <ToolSelector 
          tool={tool} 
          active={mode === 'draw'}
          onToolChange={setTool} />
      </section>
    </section>
  )

}