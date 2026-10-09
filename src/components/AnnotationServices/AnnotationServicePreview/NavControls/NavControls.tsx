import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcwDot, RotateCcwSquare, RotateCwSquare, SquareCenterlineDashedHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import { useViewer } from '@annotorious/react';
import { Rotation } from '@/services';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { Toggle } from '@/ui/Toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';

interface NavControlsProps {

  onChangeFlipped(flipped: boolean): void;

  onChangeRotation(rotation: Rotation): void;

}

const normalizeRotation = (rotation: number) =>
  ((rotation % 360) + 360) % 360;

const toSignedRotation = (rotation: number) => {
  const normalized = normalizeRotation(rotation);
  return normalized > 180 ? normalized - 360 : normalized;
}

export const NavControls = (props: NavControlsProps) => {

  const { t } = useTranslation('smartTools');

  const viewer = useViewer();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (viewer)
      setRotation(toSignedRotation(Math.round(viewer.viewport.getRotation())));
  }, [viewer]);

  const onRotate90deg = (clockwise: boolean) => () => {
    const signFlip = viewer.viewport.getFlip() ? -1 : 1;
    const signDir = clockwise ? 1: -1;
    const angle = 90 * signFlip * signDir;

    viewer.viewport.rotateBy(angle);

    const nextRotation = normalizeRotation(Math.round(viewer.viewport.getRotation()));
    setRotation(toSignedRotation(nextRotation));
    props.onChangeRotation(nextRotation);
  }

  const onSetRotation = (event: ChangeEvent<HTMLInputElement>) => {
    const sliderRotation = Number(event.currentTarget.value);
    setRotation(sliderRotation);

    const nextRotation = normalizeRotation(sliderRotation);
    viewer.viewport.setRotation(nextRotation);
    props.onChangeRotation(nextRotation);
  }

  const onResetRotation = () => {
    viewer.viewport.setRotation(0);
    setRotation(0);
    props.onChangeRotation(0);
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
            onClick={onRotate90deg(false)}>
            <RotateCcwSquare className="size-4.5" />
          </Button>
        </TooltipTrigger>

        <TooltipContent collisionPadding={20}>
          {t('servicePreview.nav.rotateCounterClockwise')}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="bg-white shadow-xs size-9.5"
            onClick={onRotate90deg(true)}>
            <RotateCwSquare className="size-4.5" />
          </Button>
        </TooltipTrigger>

        <TooltipContent collisionPadding={20}>
          {t('servicePreview.nav.rotateClockwise')}
        </TooltipContent>
      </Tooltip>

      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="bg-white shadow-xs size-9.5"
                aria-label={t('servicePreview.nav.rotation')}>
                <RefreshCcwDot className="size-4.5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>

          <TooltipContent collisionPadding={20}>
            {t('servicePreview.nav.rotation')}
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          align="center"
          sideOffset={8}
          className="w-56 p-3 shadow-lg">
          <label className="flex flex-col gap-2 text-xs">
            <span className="flex items-center justify-between">
              <span>{t('servicePreview.nav.rotation')}</span>
              <span className="tabular-nums">{rotation}°</span>
            </span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              aria-label={t('servicePreview.nav.rotation')}
              className="w-full accent-primary"
              onChange={onSetRotation}
              onDoubleClick={onResetRotation} />
          </label>
        </PopoverContent>
      </Popover>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            className="bg-white shadow-xs size-9.5"
            onPressedChange={onFlip}>
            <SquareCenterlineDashedHorizontal className="size-4.5" />
          </Toggle>
        </TooltipTrigger>

        <TooltipContent collisionPadding={20}>
          {t('servicePreview.nav.flip')}
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
          {t('servicePreview.nav.zoomIn')}
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
          {t('servicePreview.nav.zoomOut')}
        </TooltipContent>
      </Tooltip>
    </div>
  )

}