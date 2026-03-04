import { RotateCcwSquare, RotateCwSquare, ZoomIn, ZoomOut } from 'lucide-react';
import { useViewer } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';

export const NavControls = () => {

  const viewer = useViewer();

  const onZoom = (factor: number) => () =>
    viewer.viewport.zoomBy(factor);

  const onRotate = (clockwise: boolean) => () =>
    viewer.viewport.rotateBy(clockwise ? 90 : -90);

  return (
    <div className="absolute top-2 right-2 flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="bg-white shadow-xs size-9.5"
            onClick={onRotate(false)}>
            <RotateCcwSquare className="size-4.5" />
          </Button>
        </TooltipTrigger>

        <TooltipContent collisionPadding={20}>
          Rotate counter-clockwise
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="bg-white shadow-xs size-9.5"
            onClick={onRotate(true)}>
            <RotateCwSquare className="size-4.5" />
          </Button>
        </TooltipTrigger>

        <TooltipContent collisionPadding={20}>
          Rotate clockwise
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="bg-white shadow-xs size-9.5"
            onClick={onZoom(2)}>
            <ZoomIn className="size-4.5" />
          </Button>
        </TooltipTrigger>

        <TooltipContent collisionPadding={20}>
          Zoom in
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="bg-white shadow-xs size-9.5"
            onClick={onZoom(0.5)}>
            <ZoomOut className="size-4.5" />
          </Button>
        </TooltipTrigger>

        <TooltipContent collisionPadding={20}>
          Zoom out
        </TooltipContent>
      </Tooltip>
    </div>
  )

}