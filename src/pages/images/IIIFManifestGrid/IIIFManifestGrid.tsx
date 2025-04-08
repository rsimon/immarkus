import { useMemo } from 'react';
import murmur from 'murmurhash';
import { useNavigate, useParams } from 'react-router-dom';
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

  const { folder: folderId } = useParams();

  const [_, rangeId] = useMemo(() => folderId.split('@'), [folderId]);
  
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

  // For testing: 3370436377 ("Binding")
  const gridItems = useMemo(() => {
    if (!parsedManifest) return [];

    const toc = parsedManifest.getTableOfContents();

    // ToC viewing mode unless all ToC nodes are leaf nodes
    const renderAsToC = !toc.every(node => {
      // A true leaf node, with no children
      const isLeafNode = node.children.length === 0;

      // A defacto leaf, with only a single child that's a canvas.
      const isLeafRange = node.children.length === 1 && node.children[0].type === 'canvas';

      return isLeafNode || isLeafRange;
    });

    console.log('render as ToC', renderAsToC);

    if (renderAsToC) {
      // Current 'folder root' range, if any
      const currentRange = rangeId ? parsedManifest.structure.find(range => {
        const hash = murmur.v3(range.id);
        return rangeId === hash.toString();
      }) : undefined;

      console.log('current range:', currentRange.getLabel());

      if (currentRange) {
        // We'll flatten child ranges that have 
        // - only a single canvas child 
        // - and no nested child ranges
        const flattenedCanvases = currentRange.ranges.reduce<CozyCanvas[]>((agg, range) => {
          const shouldFlatten = range.canvases.length === 1 && range.ranges.length === 0;
          return shouldFlatten ? [...agg, ...range.canvases] : agg;
        }, currentRange.canvases);

        const canvasesInThisRange = new Set(flattenedCanvases.map(c => c.id));
        return props.manifest.canvases.filter(info => canvasesInThisRange.has(info.uri));
      } else {
        return [];
      }
    } else {
      // No ToC - render all canvases flat
      return props.manifest.canvases;
    }
  }, [rangeId, props.manifest, parsedManifest])

  const filtered: CanvasInformation[] = useMemo(() => {
    if (!props.hideUnannotated) return gridItems;

    return gridItems.filter(c => annotationsByCanvas[c.id] > 0);
  }, [gridItems, props.hideUnannotated, annotationsByCanvas]);

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