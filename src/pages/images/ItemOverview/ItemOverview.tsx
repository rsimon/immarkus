import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { W3CAnnotation } from '@annotorious/react';
import { Folder, IIIFManifestResource, IIIFResource, Image, LoadedFileImage, RootFolder } from '@/model';
import { useImages, useStore } from '@/store';
import { usePersistentState } from '@/utils/usePersistentState';
import { FolderHeader } from './FolderHeader';
import { ItemGrid } from './ItemGrid';
import { ItemTable } from './ItemTable';
import { AnnotationMap, OverviewItem, OverviewLayout } from '../Types';
import { ChartNoAxesColumnDecreasing } from 'lucide-react';

interface ItemOverviewProps {

  folder: Folder | RootFolder; 

  hideUnannotated: boolean;

  selected?: OverviewItem;

  onChangeHideUnannotated(hide: boolean): void;

  onSelect(item: OverviewItem): void;

  onShowMetadata(): void;

}

export const ItemOverview = (props: ItemOverviewProps) => {

  const { hideUnannotated } = props;

  const store = useStore();

  const [layout, setLayout] = usePersistentState<OverviewLayout>('immarkus:images:layout', 'grid');
  
  const { folders, iiifResources, images } = useMemo(() => {
    return store.getFolderContents(props.folder.handle)
  }, [props.folder, store]);

  const loadedImages = useImages(images.map(i => i.id)) as LoadedFileImage[];

  const [annotations, setAnnotations] = useState<AnnotationMap>({
    images: {}, folders: {}
  });

  useEffect(() => {
    const imageAnnotations = images
      .reduce<Promise<Record<string, W3CAnnotation[]>>>((promise, image) => 
        promise.then(agg => 
          store.getAnnotations(image.id, { type: 'image' }).then(a => ({ ...agg, [image.id]: a }))
        ), Promise.resolve({}));

    imageAnnotations.then(a => setAnnotations(current => ({...current, images: a })));

    const folderAnnotations = [
      ...folders.map(f => f.id),
      ...iiifResources.map(r => `iiif:${r.id}`)
    ].reduce<Promise<Record<string, W3CAnnotation[]>>>((promise, sourceId) =>
      promise.then(agg =>
        store.getAnnotationsRecursive(sourceId, { type: 'image'}).then(a => ({...agg, [sourceId]: a }))
      ), Promise.resolve({}));

    folderAnnotations.then(a => setAnnotations(current => ({...current, folders: a })));
  }, [folders, iiifResources, images]);

  const navigate = useNavigate();

  const onOpenFolder = (folder: Folder | IIIFManifestResource) =>
    navigate(`/images/${folder.id}`);

  const onOpenImage = (imageId: string) =>
    navigate(`/annotate/${imageId}`);
  
  const onSelectFolder = (folder: Folder) =>
    props.onSelect({ type: 'folder', ...folder });

  const onSelectImage = (image: Image) =>
    props.onSelect({ type: 'image', ...image });

  const onSelectItem = (item: OverviewItem) =>
    props.onSelect(item);

  const filteredFolders = useMemo(() => {
    const hasAnnotations = (folder: Folder) =>
      (annotations.folders[folder.id] || []).length > 0;

    return hideUnannotated ? folders.filter(hasAnnotations) : folders;
  }, [hideUnannotated, folders, annotations]);

  const filteredIIIFResources = useMemo(() => {
    const hasAnnotations = (resource: IIIFResource) =>
      (annotations.folders[`iiif:${resource.id}`] || []).length > 0;

    return hideUnannotated ? iiifResources.filter(hasAnnotations) : iiifResources;
  }, [hideUnannotated, iiifResources, annotations]);

  const filteredImages = useMemo(() => {
    const hasAnnotations = (item: LoadedFileImage) => 
        (annotations.images[item.id] || []).length > 0;

    return hideUnannotated ? loadedImages.filter(hasAnnotations) : loadedImages
  }, [hideUnannotated, loadedImages, annotations]);

  return (
    <div>
      <FolderHeader 
        folder={props.folder} 
        hideUnannotated={props.hideUnannotated}
        layout={layout}
        onSetLayout={setLayout}
        onShowMetadata={props.onShowMetadata} 
        onChangeHideUnannotated={props.onChangeHideUnannotated} />

      {layout === 'grid' ? (
        <ItemGrid
          annotations={annotations}
          folders={filteredFolders} 
          hideUnannotated={props.hideUnannotated}
          iiifResources={filteredIIIFResources}
          images={filteredImages} 
          selected={props.selected}
          onOpenFolder={onOpenFolder} 
          onOpenImage={onOpenImage} 
          onSelectFolder={onSelectFolder} 
          onSelectImage={onSelectImage} 
          onSelectItem={onSelectItem} />
      ) : (
        <ItemTable
          annotations={annotations}
          folders={filteredFolders} 
          hideUnannotated={props.hideUnannotated}
          iiifResources={filteredIIIFResources}
          images={filteredImages} 
          selected={props.selected}
          onOpenFolder={onOpenFolder} 
          onOpenImage={onOpenImage} 
          onSelectFolder={onSelectFolder} 
          onSelectImage={onSelectImage} 
          onSelectItem={onSelectItem} />
      )}
    </div>
  );
}