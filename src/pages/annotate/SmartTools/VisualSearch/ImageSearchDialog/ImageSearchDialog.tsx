import { useEffect, useMemo, useState } from 'react';
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

  const [previewImage, setPreviewImage] = useState<LoadedImage | undefined>();

  const [allResults, setAllResults] = useState<ResolvedSearchResult[] | undefined>();

  const filteredResults = useMemo(() => {
    if (!allResults) return;

    if (searchScope === 'all') 
      return allResults;
    else if (searchScope === 'this')
      return allResults.filter(r => r.imageId === queryImageId);
    else 
      return allResults.filter(r => r.imageId !== queryImageId);
  }, [allResults, searchScope, queryImageId]);

  useEffect(() => {
    if (
      (searchScope !== 'this') ||
      (filteredResults || []).length === 0
    ) {
      setPreviewImage(undefined);
    } else {
      setPreviewImage(filteredResults[0].image);
    }
  }, [searchScope, filteredResults]);

  const onOpenChange = (open: boolean) => {
    if (!open)
      props.onClose();
  }

  useEffect(() => {
    if (!props.open || selected.length !== 1 || props.images.length === 0) return;

    const { annotation, annotatorId } = selected[0]; 

    const queryBaseImage = props.images.find(i => i.id === annotatorId);

    if (!queryBaseImage) return;

    setAllResults(undefined);
    setPreviewImage(undefined);
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
        const clipped = results.filter(r => r.score >= 0.81);
        const uniqueImages = [...new Set(clipped.map(r => r.imageId))];

        loadImages(uniqueImages, store).then(loaded => {
          const resolved = clipped.map(result => {
            const image = loaded.find(l => l.id === result.imageId);
            return {...result, image, isQueryImage: image.id === queryBaseImage.id };
          });
          setAllResults(resolved);
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
          results={filteredResults}
          searchScope={searchScope}
          iconSize={iconSize}
          onChangeSearchScope={setSearchScope}
          onChangeIconSize={setIconSize} 
          onClose={props.onClose} />

        <div className="grow relative overflow-hidden">
          <div className="flex h-full">
            <div className="sticky top-0 w-72 h-full shrink-0 self-start bg-white">
              {filteredResults && (
                <Sidebar 
                  currentPreview={previewImage?.id}
                  queryImageId={selected[0]?.annotatorId}
                  results={filteredResults} 
                  onSetPreview={setPreviewImage} />
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {(filteredResults && previewImage) ? (
                <Annotorious>
                  <ImagePreview 
                    image={previewImage} 
                    results={filteredResults} />
                </Annotorious>
              ) : filteredResults ? (
                // Note: Masonry component breaks if the items array chnages!
                // Using `key` to remount the component is the canonical recommended
                // way to mutate Masonry layout dynamically. 
                <div 
                  key={`${selected[0]?.annotation.id}:${searchScope}`}
                  className="p-2.5">
                  <ResultGrid
                    queryImageId={queryImageId}
                    iconSize={iconSize}
                    results={filteredResults} />
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
    </Dialog>
  )

}