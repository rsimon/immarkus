import { MessagesSquare } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { IIIFIcon } from '@/components/IIIFIcon';
import { IIIFThumbnail } from '@/components/IIIFThumbnail';
import { IIIFManifestResource } from '@/model';
import { useManifestAnnotations } from '@/store';
import { Skeleton } from '@/ui/Skeleton';
import { useCanvas } from '@/utils/iiif/hooks';
import { SingleCanvasManifestItemActions } from './SingleCanvasManifestItemActions';
import { GridItem } from '../../../Types';

interface SingleCanvasManifestItemProps {

  resource: IIIFManifestResource;

  onDelete(): void;

  onSelect(item: GridItem): void;

}

export const SingleCanvasManifestItem = (props: SingleCanvasManifestItemProps) => {

  const { ref, inView } = useInView();

  const navigate = useNavigate();

  const info = props.resource.canvases[0];

  const id = `iiif:${info.manifestId}:${info.id}`;

  const annotations = useManifestAnnotations(props.resource.id, {
    type: 'image',
    includeCanvases: true
  });

  const canvas = useCanvas(id);

  const onOpen = () =>
    navigate(`/annotate/iiif:${info.manifestId}:${info.id}`);

  const onSelectCanvas = () =>
    props.onSelect({ type: 'canvas', canvas, info });

  const onSelectManifest = () => props.onSelect(props.resource);

  return (
    <div ref={ref}>
      {(inView && canvas) ? (
        <div>
          <div className="relative flex items-center justify-center w-[180px] h-[200px]">
            <div 
              className="image-item cursor-pointer relative overflow-hidden rounded-md border w-[178px] h-[178px]">
              {inView ? (
                <IIIFThumbnail
                  canvas={canvas}
                  className="h-full w-full object-cover object-center transition-all aspect-square" 
                  onClick={onOpen} />
              ) :(
                <div className="h-full w-full bg-muted" />
              )}

              <IIIFIcon
                light
                className="iiif-logo text-white transition-all absolute top-2.5 left-2.5 size-5" />

              <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full pointer-events-auto">
                <div className="text-white text-sm">
                  <MessagesSquare 
                    size={18} 
                    className="inline align-text-bottom mr-1" /> 
                    {annotations.length}
                </div>

                <div className="absolute bottom-0.5 right-2 text-white text-sm pointer-events-auto">
                  <SingleCanvasManifestItemActions
                    canvas={info}
                    onDelete={props.onDelete}
                    onSelectCanvas={onSelectCanvas} 
                    onSelectManifest={onSelectManifest} />
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm ml-1 max-w-[190px] overflow-hidden">
            <h3 
              className="overflow-hidden whitespace-nowrap text-ellipsis">
              {props.resource.name}
            </h3>
            <p className="pt-1 text-xs text-muted-foreground">
              {canvas.width?.toLocaleString()} x {canvas.height?.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center justify-center w-[180px] h-[200px]">
          <Skeleton className="size-[178px] rounded-md shadow-sm" />
        </div>
      )}
    </div>
  )

}