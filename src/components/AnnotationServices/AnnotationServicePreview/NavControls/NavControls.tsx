import { useTranslation } from 'react-i18next';
import { RotateCcwSquare, RotateCwSquare, SquareCenterlineDashedHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import { useViewer } from '@annotorious/react';
import { Rotation } from '@/services';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { Toggle } from '@/ui/Toggle';

interface NavControlsProps {

  onChangeFlipped(flipped: boolean): void;

  onChangeRotation(rotation: Rotation): void;

}

export const NavControls = (props: NavControlsProps) => {

  const { t } = useTranslation('smartTools');

  const viewer = useViewer();

  const onRotate = (clockwise: boolean) => () => {
    const signFlip = viewer.viewport.getFlip() ? -1 : 1;
    const signDir = clockwise ? 1: -1;
    const angle = 90 * signFlip * signDir;

    viewer.viewport.rotateBy(angle);
    props.onChangeRotation(viewer.viewport.getRotation() as Rotation);
  }

  const onFlip = (flipped: boolean) => {
    viewer.viewport.setFlip(flipped);
    props.onChangeFlipped(flipped);
  }

  const onZoom = (factor: number) => () =>
    viewer.viewport.zoomBy(factor);

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
          {t('transcribe.nav.rotateCounterClockwise')}
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
          {t('transcribe.nav.rotateClockwise')}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            className="bg-white shadow-xs size-9.5"
            onPressedChange={onFlip}>
            <SquareCenterlineDashedHorizontal className="size-4.5" />
          </Toggle>
        </TooltipTrigger>

        <TooltipContent collisionPadding={20}>
          {t('transcribe.nav.flip')}
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
          {t('transcribe.nav.zoomIn')}
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
          {t('transcribe.nav.zoomOut')}
        </TooltipContent>
      </Tooltip>
    </div>
  )

}