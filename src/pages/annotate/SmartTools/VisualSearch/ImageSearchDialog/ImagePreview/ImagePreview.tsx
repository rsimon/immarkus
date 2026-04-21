import { useCallback, useEffect, useMemo, useState } from 'react';
import { Scan, Trash2 } from 'lucide-react';
import { W3CImageRelationFormat, isConnectionAnnotation } from '@annotorious/plugin-wires-react';
import { LoadedImage } from '@/model';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { getOSDTilesets } from '@/utils/iiif';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import {
  AnnotationState,
  AnnotoriousOpenSeadragonAnnotator, 
  createBody, 
  DrawingStyle, 
  ImageAnnotation, 
  OpenSeadragonAnnotator, 
  OpenSeadragonViewer, 
  useAnnotator, 
  UserSelectAction,
  W3CImageAnnotation
} from '@annotorious/react';

interface ImagePreviewProps {

  image: LoadedImage;

  results: ResolvedSearchResult[];

  queryAnnotation: ImageAnnotation;

}

export const ImagePreview = (props: ImagePreviewProps) => {

  const { image, results } = props;

  const [selectedAnnotations, setSelectAnnotations] = useState<ImageAnnotation[]>([]);

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const store = useStore();

  const options: OpenSeadragon.Options = useMemo(() => ({
    tileSources: 'data' in image ? {
      type: 'image',
      url: URL.createObjectURL(image.data)
    } as object : getOSDTilesets(image.canvas),
    gestureSettingsMouse: {
      clickToZoom: false,
      dblClickToZoom: false
    },
    crossOriginPolicy: 'Anonymous',
    showNavigationControl: false,
    minZoomLevel: 0.1,
    maxZoomLevel: 100
  }), [image.id]);

  const style = useCallback((annotation: ImageAnnotation, state: AnnotationState): DrawingStyle => {
    const isSearchResult = 
      annotation.bodies.find(b => b.purpose === 'tagging' && b.value === 'search-result');

    const isSelected = isSearchResult && selectedAnnotations.some(a => a.id === annotation.id);

    if (isSearchResult) {
      return isSelected ? {
        fill: '#ff1493',
        fillOpacity: 0.2,
        stroke: '#ff1493',
        strokeOpacity: 0.75
      } : {
        fill: state?.hovered ? '#ff1493' : '#fff',
        fillOpacity: state?.hovered ? 0.25 : 0.1,
        stroke: state?.hovered ? '#ff1493' : '#fff',
        strokeOpacity: 0.75
      }
    } else {
      return {
        fillOpacity: 0,
        stroke: '#1a1a1a',
        strokeWidth: 1.5,
        strokeOpacity: 0.9
      }
    }
  }, [selectedAnnotations]);

  useEffect(() => {
    if (!anno) return;

    const annotations = results
      .filter(r => r.imageId === image.id)
      .map(r => {
        const [ x, y, w, h] = r.pxBounds;
        
        const annotation = boundsToAnnotation({
          minX: x, 
          minY: y,
          maxX: x + w,
          maxY: y + h
        });

        return {
          ...annotation,
          bodies: [createBody(annotation.id, {
            purpose: 'tagging',
            value: 'search-result'
          })]
        }
      });

    // All search results are added to the annotator,
    // including those that may already have been imported.
    // Why is this not a problem? See below!
    anno.setAnnotations(annotations, true);

    const onClick = (annotation: ImageAnnotation) => {
      setSelectAnnotations(current => {
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
      anno?.state.store.bulkDeleteAnnotations(annotations);
    }
  }, [anno, store, image, results]);

  useEffect(() => {
    if (!anno) return;

    const existing: ImageAnnotation[] = [];

    store.getAnnotations(image.id).then(annotations => {
      const adapter = W3CImageRelationFormat('canvas' in image ? image.id : image.name);
      const { parsed } = adapter.parseAll(annotations);

      const existingAnnotations: ImageAnnotation[] = parsed
        .filter(a => !isConnectionAnnotation(a))
        .map((a: ImageAnnotation) => ({
          ...a,
          bodies: [createBody(a.id, {
            purpose: 'tagging',
            value: 'user-annotation'
          })]
        }));

      existing.push(...existingAnnotations);

      // Note that a bit of "magic" happens here. Existing annotations
      // Will silently overwrite search results with the same ID, which is
      // why we don't have to manually remove search results that were
      // already imported (see note above).
      anno.setAnnotations(existingAnnotations, false);
    });

    return () => {
      anno.state.store.bulkDeleteAnnotations(existing);
    }
  }, [anno, store, image]);

  const onImportSelection = () => {
    if (!store || selectedAnnotations.length === 0) return; // Should never happen
    
    // Import current selection as W3C image annotation
    const adapter = W3CImageRelationFormat('canvas' in image ? image.id : image.name);
      
    // Copy bodies from the query annotation
    const toImport = selectedAnnotations.map(s => ({...s, bodies: [...props.queryAnnotation.bodies] }));
    const w3c = toImport.map(i => adapter.serialize(i) as W3CImageAnnotation);

    setSelectAnnotations([]);

    store.bulkUpsertAnnotation(image.id, w3c);
  }

  return (
    <div className="relative size-full bg-white p-2">
      <div className="bg-muted size-full rounded border">
        <OpenSeadragonAnnotator
          userSelectAction={UserSelectAction.NONE}
          style={style}>
          <OpenSeadragonViewer
            className="h-full w-full"
            options={options} />
        </OpenSeadragonAnnotator>

        {selectedAnnotations.length > 0 && (
          <div 
            className="absolute bottom-2 right-2 z-10 bg-black text-white py-1.5 pl-3 pr-2 rounded-md shadow-md flex gap-4 items-center">
        
            <div className="flex gap-2 text-sm items-center font-light whitespace-nowrap">
              <Scan className="size-4.5" />
              {selectedAnnotations.length.toLocaleString()} Selected

              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="rounded p-2 hover:bg-white/25 -ml-1"
                    onClick={() => setSelectAnnotations([])}>
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>

                <TooltipContent>
                  Clear Selection
                </TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-8 rounded-sm bg-green-600 whitespace-nowrap"
                  onClick={onImportSelection}>
                  Import to IMMARKUS
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                Import all selected annotations
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div> 
  )

}