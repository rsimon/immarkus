import { useEffect, useMemo, useState } from 'react';
import { v5 as uuidv5 } from 'uuid';
import { W3CImageRelationFormat, isConnectionAnnotation } from '@annotorious/plugin-wires-react';
import { LoadedImage } from '@/model';
import { useStore } from '@/store';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { ImagePreviewToolbar } from './ImagePreviewToolbar';
import { useImagePreview } from './useImagePreview';
import {
  AnnotoriousOpenSeadragonAnnotator, 
  createBody, 
  ImageAnnotation, 
  OpenSeadragonAnnotator, 
  OpenSeadragonViewer, 
  useAnnotator, 
  UserSelectAction,
  W3CImageAnnotation
} from '@annotorious/react';

interface ImagePreviewProps {

  isClosable: boolean;

  image: LoadedImage;

  results: ResolvedSearchResult[];

  queryAnnotation: ImageAnnotation;

  onClosePreview(): void;

}

// Random UUID v5 namespace for deterministic IDs
const NAMESPACE = 'a7cb2652-a967-405c-bcee-a08ba86ab6c1';

const getDeterministicId = (imageId: string, bounds: [number, number, number, number]) =>
  uuidv5(`${imageId}-${bounds.join(',')}`, NAMESPACE);

export const ImagePreview = (props: ImagePreviewProps) => {

  const { image, results } = props;

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const store = useStore();

  const [selectedAnnotations, setSelectAnnotations] = useState<ImageAnnotation[]>([]);

  const [disambiguatedResults, setDisambiguatedResults] = useState<ImageAnnotation[]>([]);

  const { options, style } = useImagePreview(image, selectedAnnotations);

  useEffect(() => {
    if (!anno) return;

    // Add existing annotations first
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

      anno.setAnnotations(existingAnnotations, true);
    }).then(() => {
      // Next, convert results to annotations...
      const allAnnotations = results
        .filter(r => r.imageId === image.id)
        .map(r => {
          const [ x, y, w, h] = r.pxBounds;
          
          const annotation = boundsToAnnotation({
            minX: x, 
            minY: y,
            maxX: x + w,
            maxY: y + h
          }, getDeterministicId(r.imageId, r.pxBounds));

          return {
            ...annotation,
            bodies: [createBody(annotation.id, {
              purpose: 'tagging',
              value: 'search-result'
            })]
          }
        });

      // ...and remove all that were already imported by the user
      const toAdd = allAnnotations.filter(a => !anno.getAnnotationById(a.id));
      setDisambiguatedResults(toAdd);

      // Reset the annotator with all search results that were 
      // not imported by the user yet.
      anno.setAnnotations(toAdd, false);
    });

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
    }
  }, [anno, store, image, results]);

  const onClickSelectAll = () => {
    if (selectedAnnotations.length === disambiguatedResults.length)
      setSelectAnnotations([]);
    else
      setSelectAnnotations([...disambiguatedResults]);
  }

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

          <ImagePreviewToolbar 
            isAllSelected={selectedAnnotations.length === disambiguatedResults.length}
            isClosable={props.isClosable}
            selected={selectedAnnotations} 
            onClickSelectAll={onClickSelectAll}
            onImportSelected={onImportSelection} 
            onClosePreview={props.onClosePreview} />
        </OpenSeadragonAnnotator>
      </div>
    </div> 
  )

}