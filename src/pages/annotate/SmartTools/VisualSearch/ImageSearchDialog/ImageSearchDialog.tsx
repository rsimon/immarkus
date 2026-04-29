import { useEffect, useMemo, useState } from 'react';
import { Annotorious, type ImageAnnotation } from '@annotorious/react';
import { SearchResult } from 'browser-visual-search';
import { LoadedImage } from '@/model';
import { VisualSearch } from '@/utils/useVisualSearch';
import { loadImages, useStore } from '@/store';
import { Dialog, DialogContent } from '@/ui/Dialog';
import { FileImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';
import { Sidebar } from './Sidebar';
import { ResultGrid } from './ResultGrid';
import { Toolbar } from './Toolbar';
import { resetPalette } from './ImageSearchPalette';
import { ImagePreview } from './ImagePreview';
import { Spinner } from '@/components/Spinner';
import { Progress } from '@/ui/Progress';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader,
  AlertDialogTitle
} from '@/ui/AlertDialog';

interface ImageSearchDialogProps {

  vs: VisualSearch;

  selected: ImageAnnotation;

  sourceImage: LoadedImage;

  imagesInWorkspace: LoadedImage[];

  open: boolean;

  onClose(): void;

}

export interface ResolvedSearchResult extends SearchResult {

  isQueryImage: boolean;

  image: LoadedImage;

}

export type IconSize = 'sm' | 'md' | 'lg';

export type SearchScope = 'this' | 'workspace' | 'all';

type ModelDownloadStatus = 
  | { state: 'pending' }
  | { state: 'downloading', progress: number }
  | { state: 'ready' };

export const ImageSearchDialog = (props: ImageSearchDialogProps) => {  

  const { sourceImage, imagesInWorkspace } = props;

  const store = useStore();

  const [downloadStatus, setDownloadProgress] = 
    useState<ModelDownloadStatus>({ state: 'pending' });

  const [searchScope, setSearchScope] = 
    useState<SearchScope>(props.imagesInWorkspace.length === 1 ? 'this' : 'workspace');

  const [iconSize, setIconSize] = useState<IconSize>('md');

  const [queryImage, setQueryImage] = useState<Blob | undefined>();

  const [previewImage, setPreviewImage] = useState<LoadedImage | undefined>();

  const [allResults, setAllResults] = useState<ResolvedSearchResult[] | undefined>();

  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const filteredByScope = useMemo(() => {
    if (!allResults || !sourceImage) return;

    return searchScope === 'this' ? allResults.filter(r => r.imageId === sourceImage.id) :
      searchScope === 'workspace' ? allResults.filter(r => imagesInWorkspace.some(i => i.id === r.imageId)) :
      allResults;
  }, [allResults, searchScope, imagesInWorkspace, sourceImage]);

  const filteredByScopeAndFacets = useMemo(() => (
    filteredByScope?.filter(i => selectedImages.has(i.imageId))
  ), [filteredByScope, selectedImages]);

  const [selectedForImport, setSelectedForImport] = useState<ImageAnnotation[]>([]);

  // Defer UI state changes and allow for a warning prompt if the user
  // is about to close a preview image with active selection
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const guardedAction = (action: () => void) => {
    if (selectedForImport.length > 0) {
      setPendingAction(() => action);
    } else {
      action();
    }
  };

  const onConfirmDiscard = () => {
    pendingAction?.();
    setPendingAction(null);
  };

  const onCancelDiscard = () => {
    setPendingAction(null);
  };

  useEffect(() => {
    if (!props.vs.index || !props.open) return;

    // Download embedding model on mount (if necessary)
    props.vs.index.downloadEmbeddingModel(progress => {
      if (progress.status === 'downloading') {
        const percentage = progress.total ? Math.round(100 * progress.loaded / progress.total) : 0;
        setDownloadProgress({ state: 'downloading', progress: percentage });
      } else if (progress.status === 'model_ready') {
        setDownloadProgress({ state: 'ready' });
      }
    })
  }, [props.vs.index, props.open]);

  useEffect(() => {
    if (
      (searchScope !== 'this') ||
      (filteredByScope || []).length === 0
    ) {
      setPreviewImage(undefined);
    } else {
      setPreviewImage(filteredByScope[0].image);
    }
  }, [searchScope, filteredByScope]);

  const onOpenChange = (open: boolean) => {
    if (!open)
      guardedAction(props.onClose);
  }

  useEffect(() => {
    if (!props.open) return;
    if (downloadStatus.state !== 'ready') return;

    setAllResults(undefined);
    setPreviewImage(undefined);
    resetPalette();

    getImageSnippet(
      sourceImage, 
      props.selected, 
      true, // if IIIF -> download
      'png'
    ).then((snippet: FileImageSnippet) => {
      const blob = new Blob([snippet.data as BlobPart], { type: 'image/png' });
      setQueryImage(blob);

      props.vs.index.query(blob, null, { topK: 1000 }).then(results => {
        const clipped = results.filter(r => r.score >= 0.81);
        const uniqueImages = [...new Set(clipped.map(r => r.imageId))];

        loadImages(uniqueImages, store).then(loaded => {
          const resolved = clipped.map(result => {
            const image = loaded.find(l => l.id === result.imageId);
            return {...result, image, isQueryImage: image.id === sourceImage.id };
          });
          setAllResults(resolved);
        });
      });
    });
  }, [props.open, props.selected, sourceImage, props.vs.index, downloadStatus.state]);

  return (
    <Dialog
      open={props.open} 
      onOpenChange={onOpenChange}>
      <DialogContent 
        closeIcon={false}
        className="flex flex-col gap-0 h-11/12 w-11/12 max-w-11/12 p-0 overflow-hidden relative bg-muted">

        <Toolbar
          queryImage={queryImage}
          results={filteredByScope}
          searchScope={searchScope}
          iconSize={iconSize}
          onChangeSearchScope={scope => guardedAction(() => setSearchScope(scope))}
          onChangeIconSize={setIconSize} 
          onClose={() => guardedAction(props.onClose)} />

        <div className="grow relative overflow-hidden">
          <div className="flex h-full">
            <div className="sticky top-0 w-80 h-full shrink-0 self-start bg-white">
              {(filteredByScope && sourceImage) && (
                <Sidebar 
                  currentPreview={previewImage?.id}
                  sourceImageId={sourceImage.id}
                  imagesInWorkspace={props.imagesInWorkspace}
                  results={filteredByScope} 
                  selectedImages={selectedImages}
                  onSetSelectedImages={setSelectedImages}
                  onSetPreview={image => guardedAction(() => setPreviewImage(image))} />
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {(filteredByScope && previewImage) ? (
                <Annotorious>
                  <ImagePreview 
                    isClosable={searchScope !== 'this'}
                    image={previewImage} 
                    results={filteredByScope} 
                    queryAnnotation={props.selected}
                    selectedForImport={selectedForImport} 
                    onSelectForImport={setSelectedForImport}
                    onClosePreview={() => guardedAction(() => setPreviewImage(undefined))} />
                </Annotorious>
              ) : (filteredByScopeAndFacets && sourceImage) ? (
                // Note: Masonry component breaks if the items array changes!
                // Using `key` to remount the component is the canonical recommended
                // way to mutate Masonry layout dynamically. 
                <div 
                  key={`${props.selected.id}::${searchScope}::${[...selectedImages].join(':')}`}
                  className="p-2.5">
                  <ResultGrid
                    sourceImageId={sourceImage.id}
                    iconSize={iconSize}
                    results={filteredByScopeAndFacets} />
                </div>
              ) : downloadStatus.state === 'downloading' ? (
                <div className="size-full flex items-center justify-center border-l">
                  <div className="text-xs flex flex-col items-center gap-2">
                    <Progress 
                      value={downloadStatus.progress} 
                      className="bg-white [&>div]:bg-orange-400 h-1 w-40" />
                    <span>Dowloading embedding model</span>
                  </div>
                </div>
              ) : (
                <div className="size-full flex items-center justify-center border-l">
                  <Spinner className="size-5 text-gray-900/25" />
                </div>
              )}
              </div>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={Boolean(pendingAction)} onOpenChange={onCancelDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Discard selected results?
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              You have selected {selectedForImport.length} result{selectedForImport.length !== 1 ? 's' : ''} for import.
              If you continue, your selection will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDiscard}>
              Discard Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )

}