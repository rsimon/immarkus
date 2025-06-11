import { useMemo } from 'react';
import { CozyCanvas } from 'cozy-iiif';
import { CanvasInformation } from '@/model';
import { Skeleton } from '@/ui/Skeleton';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { IIIFCanvasItem } from './IIIFCanvasItem';
import { IIIFRangeItem } from './IIIFRangeItem';
import { CanvasItem } from '../../Types';
import { IIIFManifestOverviewLayoutProps } from '../IIIFManifestOverviewLayoutProps';
import { getAnnotationsInRange } from '../../ImagesUtils';

export const IIIFManifestGrid = (props: IIIFManifestOverviewLayoutProps) => {

  const { annotations, canvases, folders, hideUnannotated } = props;

  const parsedManifest = useIIIFResource(props.manifest.id);

  const annotationsPerFolder: Record<string, number> = useMemo(() => {
    return Object.fromEntries(folders.map(folder => { 
      const count = getAnnotationsInRange(folder, annotations).length;
      return [folder.id, count];
    }));
  }, [folders, annotations]);

  const filteredFolders = useMemo(() => (
    hideUnannotated ? folders.filter(f => annotationsPerFolder[f.id] > 0) : folders
  ), [hideUnannotated, folders, annotationsPerFolder]);

  const filteredCanvases = useMemo(() => {
    const hasAnnotation = (canvas: CanvasInformation) =>
      (annotations[canvas.id] || []).length > 0;

    return hideUnannotated ? canvases.filter(hasAnnotation) : canvases;
  }, [hideUnannotated, canvases, annotations])

  const renderCanvasItem = (info: CanvasInformation, canvas: CozyCanvas) => {
    const item: CanvasItem = ({ type: 'canvas', canvas, info });

    const isSelected = props.selected?.type === 'canvas' ?
      props.selected.info.uri === canvas.id : false;

    const annotationCount = (annotations[info.id] || []).length;

    return (
      <IIIFCanvasItem
        selected={isSelected}
        canvas={canvas} 
        canvasInfo={info}
        annotationCount={annotationCount}
        onOpen={() => props.onOpenCanvas(canvas)} 
        onSelect={() => props.onSelect(item)} />
    );
  }

  return (
    <div className="item-grid">
      {parsedManifest ? (
        <>
          {filteredFolders.length > 0 && (
            <ul>
              {filteredFolders.map((folder, idx) => (
                <li key={`${folder.id}:${idx}`}>
                  <IIIFRangeItem 
                    annotationCount={annotationsPerFolder[folder.id]}
                    range={folder} 
                    onOpen={() => props.onOpenRange(folder)} />
                </li>
              ))}
            </ul>
          )}

          <ul>
            {filteredCanvases.map((canvas, idx) => (
              <li key={`${canvas.id}:${idx}`}>
                {renderCanvasItem(canvas, parsedManifest.canvases.find(c => c.id === canvas.uri))}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul>
          {Array.from({ length: Math.max(20, props.manifest.canvases.length) }).map((_, idx) => (
            <li key={idx}>
              <Skeleton className="size-[178px] rounded-md shadow-sm" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )

}