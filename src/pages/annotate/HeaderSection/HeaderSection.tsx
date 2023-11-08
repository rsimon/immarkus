import { Link } from 'react-router-dom';
import { ChevronLeft, ImagePlus } from 'lucide-react';
import { Image } from '@/model';
import { Tool, ToolSelector } from './ToolSelector';
import { useState } from 'react';

interface HeaderSectionProps {

  images: Image[];

}

export const HeaderSection = (props: HeaderSectionProps) => {

  const [tool, setTool] = useState<Tool>('rectangle');

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
        <button className="p-2 flex text-xs rounded-md hover:bg-muted">
          <ImagePlus className="h-4 w-4 mr-1" /> Add image
        </button>

        <ToolSelector 
          tool={tool} 
          onToolChange={setTool} />
      </section>
    </section>
  )

}