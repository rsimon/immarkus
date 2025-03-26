import { useState } from 'react';
import { EllipsisVertical, Redo2, RotateCcwSquare, RotateCwSquare, Undo2 } from 'lucide-react';
import { LoadedImage } from '@/model';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Separator } from '@/ui/Separator';
import { PaginationWidget } from '../Pagination';

interface MoreToolsPanelProps {

  image: LoadedImage;

  onAddImage(imageId: string): void;

  onChangeImage(previousId: string, nextId: string): void;

  onRedo(): void;

  onRotate(clockwise: boolean): void;

  onUndo(): void;

}

export const MoreToolsPanel = (props: MoreToolsPanelProps) => {

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open}>
      <PopoverTrigger onClick={() => setOpen(!open)}>
        <EllipsisVertical
          className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
      </PopoverTrigger>

      <PopoverContent className="w-auto p-1 flex items-center text-xs" sideOffset={10}>
        <button onClick={() => props.onRotate(false)}>
          <RotateCcwSquare className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
        </button>

        <button onClick={() => props.onRotate(true)}>
          <RotateCwSquare className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
        </button>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <button onClick={props.onUndo}>
          <Undo2 className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
        </button>

        <button onClick={props.onRedo}>
          <Redo2 className="h-4 w-4 mx-1.5 text-muted-foreground hover:text-black" />
        </button>

        <Separator orientation="vertical" className="h-4 ml-1" />

        <PaginationWidget
          image={props.image}
          variant="compact"
          onChangeImage={props.onChangeImage} 
          onAddImage={props.onAddImage} />
      </PopoverContent>
    </Popover>
  )

}