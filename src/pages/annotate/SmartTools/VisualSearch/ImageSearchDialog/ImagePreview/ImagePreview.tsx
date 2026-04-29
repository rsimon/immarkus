import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { v5 as uuidv5 } from 'uuid';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
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
  UserSelectAction
} from '@annotorious/react';

interface ImagePreviewProps {

  isClosable: boolean;

  image: LoadedImage;

  results: ResolvedSearchResult[];

  queryAnnotation: ImageAnnotation;

  emphasizedResult?: ResolvedSearchResult; 

  selectedForImport: ImageAnnotation[];

  onSelectForImport: Dispatch<SetStateAction<ImageAnnotation[]>>;

  onClosePreview(): void;

}

// Random UUID v5 namespace for deterministic IDs
const NAMESPACE = 'a7cb2652-a967-405c-bcee-a08ba86ab6c1';

const getDeterministicId = (imageId: string, bounds: [number, number, number, number]) =>
  uuidv5(`${imageId}-${bounds.join(',')}`, NAMESPACE);

export const ImagePreview = (props: ImagePreviewProps) => {

  const { image, results, selectedForImport, emphasizedResult } = props;

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const manifold = useAnnotoriousManifold();

  const store = useStore();

  const [disambiguatedResults, setDisambiguatedResults] = useState<ImageAnnotation[]>([]);

  const { options, style } = useImagePreview(image, selectedForImport);

  useEffect(() => {
    if (!anno) return;

    props.onSelectForImport([]);

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
      let emphasizedAnnotationId: string;

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

          const bodies = [createBody(annotation.id, {
            purpose: 'tagging',
            value: 'search-result'
          })];

          if (r === emphasizedResult) {
            bodies.push(createBody(annotation.id, {
              purpose: 'classifying',
              value: 'emphasized'
            }));

            emphasizedAnnotationId = annotation.id;
          }

          return { ...annotation, bodies };
        });

      // ...and remove all that were already imported by the user
      const toAdd = allAnnotations.filter(a => !anno.getAnnotationById(a.id));
      setDisambiguatedResults(toAdd);

      // Reset the annotator with all search results that were 
      // not imported by the user yet.
      anno.setAnnotations(toAdd, false);

      if (emphasizedAnnotationId) {
        setTimeout(() => {
          anno.fitBounds(emphasizedAnnotationId, { padding: 80 });
        }, 250);
      }
    });

    const onClick = (annotation: ImageAnnotation) => {
      props.onSelectForImport(current => {
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
  }, [anno, store, image, results, emphasizedResult]);

  const onClickSelectAll = () => {
    if (selectedForImport.length === disambiguatedResults.length)
      props.onSelectForImport([]);
    else
      props.onSelectForImport([...disambiguatedResults]);
  }

  const onImportSelection = () => {
    if (selectedForImport.length === 0) return; // Should never happen

    // Copy bodies from the query annotation
    const toImport = selectedForImport.map(s => ({...s, bodies: [...props.queryAnnotation.bodies] }));
    props.onSelectForImport([]);

    // Update the local annotator instance of the preview
    anno.state.store.bulkUpsertAnnotations(toImport);

    // Update the main image annotator in the workspace
    const annotator = manifold.getAnnotator(image.id);
    annotator.state.store.bulkUpsertAnnotations(toImport);
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
            isAllSelected={selectedForImport.length === disambiguatedResults.length}
            isClosable={props.isClosable}
            selected={selectedForImport} 
            onClickSelectAll={onClickSelectAll}
            onImportSelected={onImportSelection} 
            onClosePreview={props.onClosePreview} />
        </OpenSeadragonAnnotator>
      </div>
    </div> 
  )

}