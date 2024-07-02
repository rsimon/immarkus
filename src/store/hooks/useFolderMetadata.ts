import { useEffect, useMemo, useState } from 'react';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, RootFolder } from '@/model';
import { useStore } from './useStore';

export const useFolderMetadata = (folder: Folder | RootFolder) => {
  const store = useStore();

  const [annotation, setAnnotation] = useState<W3CAnnotation | undefined>();

  useEffect(() => {
    store.getFolderMetadata(folder.handle)
      .then(annotation => setAnnotation(annotation || {
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        type: 'Annotation',
        id: uuidv4()
      } as W3CAnnotation));
  }, [folder]);

  const updateMetadata = (metadata: W3CAnnotationBody) => {
    const next = { 
      ...annotation,
      body: {
        ...metadata,
        purpose: 'describing'
      }
    } as W3CAnnotation;

    store.upsertFolderMetadata(folder.handle, next);

    setAnnotation(next);
  }

  const metadata = useMemo(() => annotation ? 
    Array.isArray(annotation.body) ? annotation.body[0] : annotation.body || {} : undefined, [annotation]);

  return { metadata, updateMetadata };
}