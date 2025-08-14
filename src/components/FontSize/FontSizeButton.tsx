import { ALargeSmall } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { useState } from 'react';
import { FontSize, FontSizes } from './FontSize';

interface FontSizeButtonProps {

  disabled?: boolean;

  onChangeFontSize(size: FontSize): void;

}

export const FontSizeButton = (props: FontSizeButtonProps) => {

  const [currentSize, setCurrentSize] = useState<FontSize>('base');

  const onChangeFontSize = () => {
    const currentIdx = FontSizes.indexOf(currentSize);
    const nextIdx = (currentIdx + 1) % FontSizes.length;
    const nextSize = FontSizes[nextIdx];

    setCurrentSize(nextSize);
    props.onChangeFontSize(nextSize);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          disabled={props.disabled}
          variant="ghost"
          size="icon"
          type="button"
          className="h-6 w-auto py-3.5 px-2 rounded-full"
          onClick={onChangeFontSize}>
          <ALargeSmall className="size-4.5" />
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        Change font size
      </TooltipContent>
    </Tooltip>
  )

}