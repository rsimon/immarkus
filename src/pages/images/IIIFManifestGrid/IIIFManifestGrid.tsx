import { useCallback } from 'react';
import murmur from 'murmurhash';
import { useNavigate } from 'react-router-dom';
import { IIIFManifestResource } from '@/model';
import { useAnnotations } from '@/store';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { IIIFCanvasItem } from './IIIFCanvasItem';
import { Skeleton } from '@/ui/Skeleton';
import { CozyCanvas } from '@/utils/cozy-iiif';

interface IIIFManifestGridProps {

  manifest: IIIFManifestResource;

}

export const IIIFManifestGrid = (props: IIIFManifestGridProps) => {
  
  const navigate = useNavigate();

  const parsedManifest = useIIIFResource(props.manifest.id);

  const annotations = useAnnotations(`iiif:${props.manifest.id}`);

  const onOpenCanvas = (canvas: CozyCanvas) => {
    const id = murmur.v3(canvas.id);
    navigate(`/annotate/iiif:${props.manifest.id}:${id}`);
  }

  const countAnnotations = useCallback((canvas: CozyCanvas) => {
    const id = murmur.v3(canvas.id);
    const sourceId = `iiif:${props.manifest.id}:${id}`;
    return annotations.filter(a => 
      !Array.isArray(a.target) && a.target.source === sourceId).length;
  }, [annotations, props.manifest]);

  return (
    <div className="item-grid">
      {parsedManifest ? (
        <ul>
          {parsedManifest.canvases.map((canvas, idx) => (
            <li key={`${canvas.id}.${idx}`}>
              <IIIFCanvasItem
                canvas={canvas} 
                annotationCount={countAnnotations(canvas)}
                onOpen={() => onOpenCanvas(canvas)} />
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {props.manifest.canvases.slice(0, 20).map(canvas => (
            <li key={canvas.id}>
              <Skeleton className="size-[178px] rounded-md shadow" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )

}