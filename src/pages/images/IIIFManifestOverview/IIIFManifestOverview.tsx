import { useMemo } from 'react';
import murmur from 'murmurhash';
import { useNavigate, useParams } from 'react-router-dom';
import { CozyCanvas, CozyRange } from 'cozy-iiif';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { usePersistentState } from '@/utils/usePersistentState';
import { useManifestAnnotations } from '@/store/hooks';
import { CanvasItem, OverviewItem, OverviewLayout } from '../Types';
import { IIIFManifestHeader } from './IIIFManifestHeader';
import { IIIFManifestGrid } from './IIIFManifestGrid';
import { IIIFManifestTable } from './IIIFManifestTable';

interface IIIFManifestOverviewProps {

  manifest: IIIFManifestResource;

  hideUnannotated: boolean;

  selected?: OverviewItem;

  onChangeHideUnannotated(hide: boolean): void;

  onShowMetadata(): void;

  onSelect(item: CanvasItem): void;

}

export const IIIFManifestOverview = (props: IIIFManifestOverviewProps) => {

  const { folder: folderId } = useParams();

  const [layout, setLayout] = usePersistentState<OverviewLayout>('immarkus:images:layout', 'grid');

  const [_, rangeId] = useMemo(() => folderId.split('@'), [folderId]);
  
  const navigate = useNavigate();

  const parsedManifest = useIIIFResource(props.manifest.id);

  const annotations = useManifestAnnotations(props.manifest.id, { 
    type: 'image',
    includeCanvases: true
  });

  const annotationsByCanvas = useMemo(() => {
    const getAnnotationsOnCanvas = (canvas: CanvasInformation) => {
      const sourceId = `iiif:${props.manifest.id}:${canvas.id}`;
      return annotations.filter(a => 
        !Array.isArray(a.target) && a.target.source === sourceId);
    }

   return Object.fromEntries(props.manifest.canvases.map(canvas => 
      ([ canvas.id, getAnnotationsOnCanvas(canvas)])));
  }, [annotations, props.manifest]);

  const onOpenCanvas = (canvas: CozyCanvas) => {
    const id = murmur.v3(canvas.id);
    navigate(`/annotate/iiif:${props.manifest.id}:${id}`);
  }

  const onOpenRange = (range: CozyRange) => {
    const id = murmur.v3(range.id);
    navigate(`/images/${props.manifest.id}@${id}`);
  }

  const { folders, canvases, breadcrumbs } = useMemo(() => {
    if (!parsedManifest) return { folders: [], canvases: [], breadcrumbs: [] };

    const toc = parsedManifest.getTableOfContents();

    // ToC viewing mode unless all ToC nodes are leaf nodes
    const renderAsToC = !toc.root.every(node => node.navSections.length === 0);
    if (renderAsToC) {
      const currentRange = rangeId ? parsedManifest.structure.find(range => {
        const hash = murmur.v3(range.id);
        return rangeId === hash.toString();
      }) : undefined;

      if (currentRange) {
        const thisNode = toc.getNode(currentRange.id);
        
        // Breadcrumbs start with the document itself, then all sub-foldders
        const breadcrumbs = [...toc.getBreadcrumbs(currentRange.id)];

        const { navItems, navSections: folders } = thisNode;

        const canvases = navItems.map(i => props.manifest.canvases.find(c => c.uri === i.id));
        return { folders, canvases, breadcrumbs, currentRange };
      } else if (!rangeId) {
        const { root } = toc; // Root 

        const folders = root.filter(n => (n.navItems.length + n.navSections.length) > 0).map(n => n.source) as CozyRange[];
        const navItems = root.filter(n => (n.navItems.length + n.navSections.length) === 0);

        const canvases = navItems.map(i => props.manifest.canvases.find(c => c.uri === i.id));
        return { folders, canvases, breadcrumbs: [] };
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

    return canvases.filter(c => (annotationsByCanvas[c.id] || []).length > 0);
  }, [canvases, props.hideUnannotated, annotationsByCanvas]);

  return (
    <div>
      <IIIFManifestHeader
        layout={layout}
        manifest={props.manifest} 
        breadcrumbs={breadcrumbs}
        hideUnannotated={props.hideUnannotated} 
        onChangeHideUnannotated={props.onChangeHideUnannotated}
        onSetLayout={setLayout}
        onShowMetadata={props.onShowMetadata} />

      {layout === 'grid' ? (
        <IIIFManifestGrid
          annotations={annotationsByCanvas}
          canvases={filtered}
          folders={folders}
          hideUnannotated={props.hideUnannotated}
          manifest={props.manifest}
          selected={props.selected}
          onOpenCanvas={onOpenCanvas}
          onOpenRange={onOpenRange}
          onSelect={props.onSelect} />
      ) : (
        <IIIFManifestTable
          annotations={annotationsByCanvas}
          canvases={filtered} 
          folders={folders}
          hideUnannotated={props.hideUnannotated} 
          manifest={props.manifest}
          selected={props.selected} 
          onOpenCanvas={onOpenCanvas} 
          onOpenRange={onOpenRange} 
          onSelect={props.onSelect} />
      )}
    </div>
  )

}