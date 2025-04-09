import { useMemo } from 'react';
import murmur from 'murmurhash';
import { useNavigate, useParams } from 'react-router-dom';
import { CozyCanvas, CozyRange } from 'cozy-iiif';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { Skeleton } from '@/ui/Skeleton';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { useManifestAnnotations } from '@/store/hooks';
import { IIIFCanvasItem } from './IIIFCanvasItem';
import { CanvasGridItem, GridItem } from '../Types';
import { IIIFRangeItem } from './IIIFRangeItem';

interface IIIFManifestGridProps {

  manifest: IIIFManifestResource;

  filterQuery: string;

  hideUnannotated: boolean;

  selected?: GridItem;

  onSelect(item: CanvasGridItem): void;

}

export const IIIFManifestGrid = (props: IIIFManifestGridProps) => {

  const { folder: folderId } = useParams();

  const [canvasId, rangeId] = useMemo(() => folderId.split('@'), [folderId]);
  
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

  const onOpenRange = (range: CozyRange) => {
    const id = murmur.v3(range.id);
    navigate(`/images/${props.manifest.id}@${id}`);
  }

  const { folders, canvases } = useMemo(() => {
    if (!parsedManifest) return { folders: [], canvases: [] };

    const toc = parsedManifest.getTableOfContents();

    // ToC viewing mode unless all ToC nodes are leaf nodes
    const renderAsToC = !toc.root.every(node => node.navSections.length === 0);
    if (renderAsToC) {
      const thisRange = rangeId ? parsedManifest.structure.find(range => {
        const hash = murmur.v3(range.id);
        return rangeId === hash.toString();
      }) : undefined;

      if (thisRange) {
        const thisNode = toc.getNode(thisRange.id);
        const { navItems, navSections: folders } = thisNode;

        const canvases = navItems.map(i => props.manifest.canvases.find(c => c.uri === i.id));
        return { folders, canvases };
      } else if (!rangeId) {
        // Root 
        const { root } = toc;

        const folders = root.filter(n => (n.navItems.length + n.navSections.length) > 0).map(n => n.source) as CozyRange[];
        const navItems = root.filter(n => (n.navItems.length + n.navSections.length) === 0);

        const canvases = navItems.map(i => props.manifest.canvases.find(c => c.uri === i.id));
        return { folders, canvases };
      } else {
        // Invalid range ID!
        return { folders: [], canvases: [] };
      }
    } else {
      // No ToC - render all canvases flat
      return { folders: [], canvases: props.manifest.canvases };
    }
  }, [rangeId, props.manifest, parsedManifest])

  const filtered: CanvasInformation[] = useMemo(() => {
    if (!props.hideUnannotated) return canvases;

    return canvases.filter(c => annotationsByCanvas[c.id] > 0);
  }, [canvases, props.hideUnannotated, annotationsByCanvas]);

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

  return (
    <div className="item-grid">
      {parsedManifest ? (
        <>
          {folders.length > 0 && (
            <ul>
              {folders.map((folder, idx) => (
                <li key={`${folder.id}:${idx}`}>
                  <IIIFRangeItem 
                    range={folder} 
                    onOpen={() => onOpenRange(folder)} />
                </li>
              ))}
            </ul>
          )}
          <ul>
            {filtered.map((canvas, idx) => (
              <li key={`${canvas.id}:${idx}`}>
                {renderCanvasItem(canvas, parsedManifest.canvases.find(c => c.id === canvas.uri))}
              </li>
            ))}
          </ul>
        </>
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