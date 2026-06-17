import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IndexedImageSegment } from 'browser-visual-search';
import { LoadedImage } from '@/model';
import { useAnnotations, useImages, useStore } from '@/store';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { getDeterministicId, useVisualSearch } from '@/utils/useVisualSearch';
import { VisualSearchDebugToolbar } from './VisualSearchDebugToolbar';
import { useVisualSearchDebugView } from './useVisualSearchDebugView';
import { 
  ImageAnnotation, 
  OpenSeadragonAnnotator, 
  OpenSeadragonHoverTooltip, 
  OpenSeadragonViewer, 
  serializeW3CImageAnnotation, 
  useAnnotator, 
  UserSelectAction
} from '@annotorious/react';

interface VisualSearchDebugViewerProps {

  imageId: string;

}

const getBounds = (segment: IndexedImageSegment, image: LoadedImage) => {
  if ('canvas' in image) {
    const { width, height} = image.canvas;
    const [ nx, ny, nw, nh ] = segment.normalizedBounds;

    const x = nx * width;
    const y = ny * height;
    const w = nw * width;
    const h = nh * height;

    return [x, y, w, h];
  } else {
    return segment.pxBounds;
  }
}

export const VisualSearchDebugViewer = (props: VisualSearchDebugViewerProps) => {
  const { t } = useTranslation('common');

  const image = useImages(props.imageId) as LoadedImage;

  const vs = useVisualSearch();

  const store = useStore();

  const anno = useAnnotator();

  const [selected, setSelected] = useState<ImageAnnotation[]>([]);

  const annotations = useAnnotations(props.imageId, { type: 'image' });
  
  const { options, style } = useVisualSearchDebugView(image, annotations, selected);

  const [indexedSegments, setIndexedSegments] = useState<ImageAnnotation[]>([]);

  const isImported = useCallback((annotation: ImageAnnotation) => (
    annotations.some(a => a.id === annotation.id)
  ), [annotations]);

  const selectableSegments = useMemo(() => (
    indexedSegments.filter(s => !isImported(s))
  ), [indexedSegments, isImported]);

  const isAllSelected = selected.length === selectableSegments.length;

  useEffect(() => {
    if (!vs.index || !anno || !image) return;

    const indexedImage = vs.index.getImage(image.id);
    if (!indexedImage) return;

    const annotations = indexedImage.segments.map(segment => {
      const [x, y, w, h] = getBounds(segment, image);
      return boundsToAnnotation({
        minX: x, 
        minY: y,
        maxX: x + w,
        maxY: y + h
      }, getDeterministicId(image.id, segment.pxBounds));
    });

    setIndexedSegments(annotations);
    anno.setAnnotations(annotations);

    return () => {
      anno.clearAnnotations();
    }
  }, [vs, anno, image]);

  useEffect(() => {
    if (!anno) return;

    const onClick = (annotation: ImageAnnotation) => {
      if (isImported(annotation)) return;

      setSelected(current => {
        if (current.some(a => a.id === annotation.id)) {
          return current.filter(a => a.id !== annotation.id);
        } else {
          return [...current, annotation];
        }
      });
    }

    anno.on('clickAnnotation', onClick);

    return () => {
      anno?.off('clickAnnotation', onClick);
    }
  }, [anno]);

  const onSelectAll = () => {
    if (isAllSelected)
      setSelected([]);
    else
      setSelected(selectableSegments)
  }

  const onImportSelected = () => {
    const w3c = selected.map(a => serializeW3CImageAnnotation(a, image.id));
    store.bulkUpsertAnnotation(image.id, w3c);
    setSelected([]);
  }

  return options ? (
    <OpenSeadragonAnnotator
      style={style}
      userSelectAction={UserSelectAction.NONE}>
      <OpenSeadragonViewer
        options={options} 
        className="size-full bg-muted border rounded [&_div]:outline-none" />

      <OpenSeadragonHoverTooltip 
        tooltip={props => isImported(props.annotation) ? (
          <div className="bg-black text-white text-[11px] rounded px-1.5 py-1 font-mono">
            {t('visualSearchDebug.alreadyImported')}
          </div>
        ) : null}/>

      <VisualSearchDebugToolbar 
        isAllSelected={isAllSelected}
        selected={selected} 
        onImportSelected={onImportSelected} 
        onSelectAll={onSelectAll} />
    </OpenSeadragonAnnotator>
  ) : null;

}