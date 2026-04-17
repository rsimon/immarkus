import { useEffect, useState } from 'react';
import { Annotorious, type ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { SearchResult } from 'browser-visual-search';
import { LoadedImage } from '@/model';
import { useVisualSearch } from '@/pages/visualsearch/useVisualSearch';
import { loadImages, useStore } from '@/store';
import { Dialog, DialogContent } from '@/ui/Dialog';
import { FileImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';
import { Sidebar } from './Sidebar';
import { ResultGrid } from './ResultGrid';
import { Toolbar } from './Toolbar';
import { resetPalette } from './ImageSearchPalette';
import { ImagePreview } from './ImagePreview';
import { Spinner } from '@/components/Spinner';

interface ImageSearchDialogProps {

  images: LoadedImage[];

  open: boolean;

  onClose(): void;

}

export interface ResolvedSearchResult extends SearchResult {

  isQueryImage: boolean;

  image: LoadedImage;

}

export type IconSize = 'lg' | 'md' | 'sm';

export type SearchScope = 'all' | 'this' | 'other';

export const ImageSearchDialog = (props: ImageSearchDialogProps) => {  
  
  const store = useStore();

  const vs = useVisualSearch();

  const { selected } = useSelection();

  const queryImageId = selected[0]?.annotatorId;

  const [searchScope, setSearchScope] = useState<SearchScope>('all');

  const [iconSize, setIconSize] = useState<IconSize>('md');

  const [queryImage, setQueryImage] = useState<Blob | undefined>();

  const [results, setResults] = useState<ResolvedSearchResult[] | undefined>();

  const [previewImage, setPreviewImage] = useState<LoadedImage | undefined>();

  const onOpenChange = (open: boolean) => {
    if (!open)
      props.onClose();
  }

  useEffect(() => {
    if (!props.open || selected.length !== 1 || props.images.length === 0) return;

    const { annotation, annotatorId } = selected[0]; 

    const queryBaseImage = props.images.find(i => i.id === annotatorId);

    if (!queryBaseImage) return;

    setResults(undefined);
    resetPalette();

    getImageSnippet(
      queryBaseImage, 
      annotation as ImageAnnotation, 
      true, // if IIIF -> download
      'png'
    ).then((snippet: FileImageSnippet) => {
      const blob = new Blob([snippet.data as BlobPart], { type: 'image/png' });
      setQueryImage(blob);

      vs.index.query(blob, null, { topK: 1000 }).then(results => {
        const uniqueImages = [...new Set(results.map(r => r.imageId))];

        loadImages(uniqueImages, store).then(loaded => {
          const resolved = results.map(result => {
            const image = loaded.find(l => l.id === result.imageId);
            return {...result, image, isQueryImage: image.id === queryBaseImage.id };
          });
          setResults(resolved);
        });
      });
    });
  }, [props.open, selected, props.images, store]);

  return (
    <Dialog
      open={props.open} 
      onOpenChange={onOpenChange}>
      <DialogContent 
        closeIcon={false}
        className="flex flex-col gap-0 h-11/12 w-11/12 max-w-11/12 p-0 overflow-hidden relative bg-muted">

        <Toolbar
          queryImage={queryImage}
          results={results}
          searchScope={searchScope}
          iconSize={iconSize}
          onChangeSearchScope={setSearchScope}
          onChangeIconSize={setIconSize} 
          onClose={props.onClose} />

        <div className="grow relative overflow-hidden">
          <div className="flex h-full">
            <div className="sticky top-0 w-60 h-full shrink-0 self-start">
              {results && (
                <Sidebar 
                  queryImageId={selected[0]?.annotatorId}
                  results={results} 
                  onOpenPreview={setPreviewImage} />
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 border-l">
              {(results && previewImage) ? (
                <Annotorious>
                  <ImagePreview 
                    image={previewImage} 
                    results={results} />
                </Annotorious>
              ) : results ? (
                <ResultGrid
                  queryImageId={queryImageId}
                  iconSize={iconSize}
                  results={results} />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <Spinner className="size-8 text-gray-900/25" />
                </div>
              )}
              </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}