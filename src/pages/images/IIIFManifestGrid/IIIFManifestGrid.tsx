import { useMemo } from 'react';
import murmur from 'murmurhash';
import { useNavigate } from 'react-router-dom';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { Skeleton } from '@/ui/Skeleton';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { CozyCanvas } from 'cozy-iiif';
import { useManifestAnnotations } from '@/store/hooks';
import { IIIFCanvasItem } from './IIIFCanvasItem';
import { CanvasGridItem, GridItem } from '../Types';

interface IIIFManifestGridProps {

  manifest: IIIFManifestResource;

  filterQuery: string;

  hideUnannotated: boolean;

  selected?: GridItem;

  onSelect(item: CanvasGridItem): void;

}

export const IIIFManifestGrid = (props: IIIFManifestGridProps) => {
  
  const navigate = useNavigate();

  const parsedManifest = useIIIFResource(props.manifest.id);

  const annotations = useManifestAnnotations(props.manifest.id, { 
    type: 'image',
    includeCanvases: true
  });

  const annotationsByCanvas = useMemo(() => {
    const countAnnotations = (canvas: CanvasInformation) => {
      const sourceId = `iiif:${props.manifest.id}:${canvas.id}`;
      return annotations.filter(a => 
        !Array.isArray(a.target) && a.target.source === sourceId).length;
    }

    const { canvases } = props.manifest;

    return Object.fromEntries(canvases.map(canvas => ([canvas.id, countAnnotations(canvas)])));
  }, [annotations, props.manifest]);

  const onOpenCanvas = (canvas: CozyCanvas) => {
    const id = murmur.v3(canvas.id);
    navigate(`/annotate/iiif:${props.manifest.id}:${id}`);
  }

  const renderCanvasItem = (info: CanvasInformation, canvas: CozyCanvas) => {
    const item: CanvasGridItem = ({ type: 'canvas', canvas, info });

    const isSelected = props.selected?.type === 'canvas' ?
      props.selected.info.uri === canvas.id : false;

    const id = murmur.v3(canvas.id);

    return (
      <IIIFCanvasItem
        selected={isSelected}
        canvas={canvas} 
        canvasInfo={info}
        annotationCount={annotationsByCanvas[id]}
        onOpen={() => onOpenCanvas(canvas)} 
        onSelect={() => props.onSelect(item)} />
      );
  }

  const filtered: CanvasInformation[] = useMemo(() => {
    if (!props.hideUnannotated) return props.manifest.canvases;

    return props.manifest.canvases.filter(c => annotationsByCanvas[c.id] > 0);
  }, [props.manifest, props.hideUnannotated, annotationsByCanvas]);

  return (
    <div className="item-grid">
      {parsedManifest ? (
        <ul>
          {filtered.map((canvas, idx) => (
            <li key={`${canvas.id}.${idx}`}>
              {renderCanvasItem(canvas, parsedManifest.canvases.find(c => c.id === canvas.uri))}
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {filtered.slice(0, 20).map(canvas => (
            <li key={canvas.id}>
              <Skeleton className="size-[178px] rounded-md shadow-sm" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )

}