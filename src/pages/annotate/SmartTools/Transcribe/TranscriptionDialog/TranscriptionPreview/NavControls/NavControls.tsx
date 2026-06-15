import { useTranslation } from 'react-i18next';
import { RotateCcwSquare, RotateCwSquare, ZoomIn, ZoomOut } from 'lucide-react';
import { useViewer } from '@annotorious/react';
import { Rotation } from '@/services';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';

interface NavControlsProps {

  onChangeRotation(rotation: Rotation): void;

}

export const NavControls = (props: NavControlsProps) => {

  const { t } = useTranslation('smartTools');

  const viewer = useViewer();

  const onZoom = (factor: number) => () =>
    viewer.viewport.zoomBy(factor);

  const onRotate = (clockwise: boolean) => () => {
    viewer.viewport.rotateBy(clockwise ? 90 : -90);
    props.onChangeRotation(viewer.viewport.getRotation() as Rotation);
  }

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