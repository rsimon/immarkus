import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImages, useStore } from '@/store';
import { Folder, IIIFManifestResource, IIIFResource, Image, LoadedFileImage, RootFolder } from '@/model';
import { isSingleImageManifest } from '@/utils/iiif';
import { FolderHeader } from './FolderHeader';
import { ItemGrid } from './ItemGrid';
import { GridItem, ItemLayout } from '../Types';
import { usePersistentState } from '@/utils/usePersistentState';

interface ItemOverviewProps {

  folder: Folder | RootFolder; 

  hideUnannotated: boolean;

  selected?: GridItem;

  onChangeHideUnannotated(hide: boolean): void;

  onSelect(item: GridItem): void;

  onShowMetadata(): void;

}

export const ItemOverview = (props: ItemOverviewProps) => {

  const store = useStore();

  const [layout, setLayout] = usePersistentState<ItemLayout>('immarkus:images:layout', 'grid');
  
  const { folders, iiifResources, images } = useMemo(() => {
    return store.getFolderContents(props.folder.handle)
  }, [props.folder, store]);

  const loadedImages = useImages(images.map(i => i.id)) as LoadedFileImage[];

  const [annotationCounts, setAnnotationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const imageCounts = loadedImages
      .reduce<Promise<Record<string, number>>>((promise, image) => 
        promise.then(counts =>
          store.countAnnotations(image.id).then(count => ({...counts, [image.id]: count }))
        ), Promise.resolve({}));

    const manifestCounts = iiifResources
      .reduce<Promise<Record<string, number>>>((promise, manifest) =>
        promise.then(counts =>
          store.getManifestAnnotations(manifest.id).then(annotations => (
            {...counts, [`iiif:${manifest.id}`]: annotations.length }
          ))
        ), Promise.resolve({}));

    Promise.all([imageCounts, manifestCounts]).then(([a, b]) => {
      setAnnotationCounts({...a, ...b});    
    });
  }, [store, loadedImages]);

  const navigate = useNavigate();

  const onOpenFolder = (folder: Folder | IIIFManifestResource) =>
    navigate(`/images/${folder.id}`);

  const onOpenImage = (image: Image) =>
    navigate(`/annotate/${image.id}`);
  
  const onSelectFolder = (folder: Folder) =>
    props.onSelect({ type: 'folder', ...folder });

  const onSelectImage = (image: Image) =>
    props.onSelect({ type: 'image', ...image });

  const onSelectManifest = (manifest: IIIFManifestResource) =>
    props.onSelect(manifest);

  const filteredIIIFResources = useMemo(() => {
    const dontHide = (item: IIIFResource) => {
      if (isSingleImageManifest(item) && 'canvases' in item) {
        const canvas = item.canvases[0];
        if (!canvas) return true; // Should never happen

        return annotationCounts[`iiif:${item.id}`] > 0;
      } else {
        // Manifests with multiple images (= folder) should always be shown
        return true;
      }
    }

    return props.hideUnannotated ? iiifResources.filter(dontHide) : iiifResources;
  }, [props.hideUnannotated, iiifResources, annotationCounts]);

  const filteredImages = useMemo(() => {
    const hasAnnotations = (item: LoadedFileImage) => annotationCounts[item.id] > 0;
    return props.hideUnannotated ? loadedImages.filter(hasAnnotations) : loadedImages
  }, [props.hideUnannotated, loadedImages, annotationCounts]);

  return (
    <div>
      <FolderHeader 
        folder={props.folder} 
        hideUnannotated={props.hideUnannotated}
        layout={layout}
        onSetLayout={setLayout}
        onShowMetadata={props.onShowMetadata} 
        onChangeHideUnannotated={props.onChangeHideUnannotated} />

      <ItemGrid
        annotationCounts={annotationCounts}
        folders={folders} 
        iiifResources={filteredIIIFResources}
        images={filteredImages} 
        selected={props.selected}
        onOpenFolder={onOpenFolder} 
        onOpenImage={onOpenImage} 
        onSelectFolder={onSelectFolder} 
        onSelectImage={onSelectImage} 
        onSelectManifest={onSelectManifest} />
    </div>
  );
}