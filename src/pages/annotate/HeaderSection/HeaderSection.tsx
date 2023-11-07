import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ImagePlus, Square } from 'lucide-react';
import { Image } from '@/model';

interface HeaderSectionProps {

  images: Image[];

}

export const HeaderSection = (props: HeaderSectionProps) => {

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

        <button className="pl-2.5 py-2 pr-2 flex items-center text-xs rounded-md hover:bg-muted border shadow-sm">
          <Square className="w-4 h-4 mr-1.5" />
          Rectangle
          <ChevronDown className="h-3 w-3 ml-1" />
        </button>
        
        {/* 
          <button className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
            <TriangleRight className="w-4 h-4 mr-1.5 -rotate-[10deg] mb-0.5" />
            Polygon
          </button>

          <button className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
            <Circle className="w-4 h-4 mr-1 scale-y-90 mb-0.5" />
            Ellipse
          </button>
        */}
      </section>
    </section>
  )

}