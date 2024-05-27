import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { EllipsisVertical, RotateCcwSquare, RotateCwSquare } from 'lucide-react';
import { Image, LoadedImage } from '@/model';
import { Separator } from '@/ui/Separator';
import { PaginationWidget } from '../Pagination';
import { ToolbarButton } from '../ToolbarButton';
import { AddImage } from './AddImage';
import { useState } from 'react';

interface MoreToolsPanelProps {

  open: boolean;

  images: LoadedImage[];

  toolsDisabled: boolean;

  onAddImage(image: Image): void;

  onChangeImage(previous: Image, next: Image): void;

  onRotate(clockwise: boolean): void;

}

export const MoreToolsPanel = (props: MoreToolsPanelProps) => {

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open}>
      <PopoverTrigger 
        onClick={() => setOpen(!open)}
        className="text-xs rounded-md hover:bg-muted focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-25 disabled:hover:bg-transparent">
        <EllipsisVertical
          className="h-8 w-8 p-2" />
      </PopoverTrigger>

      <PopoverContent className="w-auto p-1" sideOffset={10}>
        <section className="flex gap-1 items-center">
          <AddImage 
            current={props.images} 
            onAddImage={props.onAddImage} />

          <Separator orientation="vertical" className="h-4" />

          <PaginationWidget 
            disabled={props.toolsDisabled}
            image={props.images[0]} 
            onChangeImage={props.onChangeImage} 
            onAddImage={props.onAddImage} />

          <Separator orientation="vertical" className="h-4" />

          <ToolbarButton
            onClick={() => props.onRotate(false)}>
            <RotateCcwSquare
              className="h-8 w-8 p-2" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => props.onRotate(true)}>
            <RotateCwSquare 
              className="h-8 w-8 p-2" />
          </ToolbarButton>
        </section>
      </PopoverContent>
    </Popover>
  )

}