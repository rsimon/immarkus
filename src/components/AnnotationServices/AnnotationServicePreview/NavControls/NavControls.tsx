import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
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

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (viewer)
      setRotation(Math.round(viewer.viewport.getRotation()) % 360);
  }, [viewer]);

  const onRotate = (clockwise: boolean) => () => {
    const signFlip = viewer.viewport.getFlip() ? -1 : 1;
    const signDir = clockwise ? 1: -1;
    const angle = 90 * signFlip * signDir;

    viewer.viewport.rotateBy(angle);
    const nextRotation = ((Math.round(viewer.viewport.getRotation()) % 360) + 360) % 360;
    setRotation(nextRotation);
    props.onChangeRotation(nextRotation);
  }

  const onSetRotation = (event: ChangeEvent<HTMLInputElement>) => {
    const nextRotation = Number(event.currentTarget.value);
    viewer.viewport.setRotation(nextRotation);
    setRotation(nextRotation);
    props.onChangeRotation(nextRotation);
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
          {t('servicePreview.nav.rotateCounterClockwise')}
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
          {t('servicePreview.nav.rotateClockwise')}
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

      <label className="absolute top-12 right-0 flex items-center gap-2 rounded-md bg-white px-2.5 py-2 text-xs shadow-xs">
        <span>{t('servicePreview.nav.rotation')}</span>
        <input
          type="range"
          min="0"
          max="359"
          step="1"
          value={rotation}
          aria-label={t('servicePreview.nav.rotation')}
          className="w-28 accent-primary"
          onChange={onSetRotation} />
        <span className="w-8 text-right tabular-nums">{rotation}°</span>
      </label>
    </div>
  )

}