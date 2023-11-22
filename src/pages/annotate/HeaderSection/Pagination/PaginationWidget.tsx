import { LoadedImage } from '@/model';
import { useImages, useStore } from '@/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ToolbarButton } from '../ToolbarButton';
import { ThumbnailStrip } from './ThumbnailStrip';

interface PaginationWidgetProps {

  image: LoadedImage;

}

export const PaginationWidget = (props: PaginationWidgetProps) => {

  return (
    <>
      <ToolbarButton>
        <ChevronLeft className="w-8 h-8 p-2" />
      </ToolbarButton>

      <ToolbarButton>
        <span className="inline-block p-2">1 / 7</span>
      </ToolbarButton>

      <ToolbarButton>
        <ChevronRight className="w-8 h-8 p-2" />
      </ToolbarButton>

      {/* <ThumbnailStrip image={props.image} /> */}
    </>
  )

}