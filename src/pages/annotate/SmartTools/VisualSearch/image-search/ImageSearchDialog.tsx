import { useEffect, useState } from 'react';
import { Masonry } from "masonic";
import type { ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { useVisualSearch } from '@/pages/visualsearch/useVisualSearch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/Dialog';
import { FileImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';
import { SearchResult } from 'browser-visual-search';
import { ImageSearchResult } from './ImageSearchResult';
import { useStore } from '@/store';

interface ImageSearchDialogProps {

  images: LoadedImage[];

  open: boolean;

  onClose(): void;

}

export interface ResolvedSearchResult extends SearchResult {

  image: LoadedImage;

}

export const ImageSearchDialog = (props: ImageSearchDialogProps) => {

  const { selected } = useSelection();

  const store = useStore();

  const vs = useVisualSearch();

  const [results, setResults] = useState<ResolvedSearchResult[]>([]);

  const onOpenChange = (open: boolean) => {
    if (!open)
      props.onClose();
  }

  useEffect(() => {
    if (!props.open || selected.length !== 1 || props.images.length === 0) return;

    const { annotation, annotatorId } = selected[0]; 

    const image = props.images.find(i => i.id === annotatorId);

    if (!image) return;

    getImageSnippet(
      image, 
      annotation as ImageAnnotation, 
      true, // if IIIF -> download
      'png'
    ).then((snippet: FileImageSnippet) => {
      const blob = new Blob([snippet.data as BlobPart], { type: 'image/png' });
      vs.index.query(blob).then(results => {
        const uniqueImages = [...new Set(results.map(r => r.imageId))];

        Promise.all(uniqueImages.map(id => store.loadImage(id))).then(loaded => {
          const resolved = results.map(result => {
            const image = loaded.find(l => l.id === result.imageId);
            return {...result, image };
          });
          setResults(resolved);
        });
      });
    });
  }, [props.open, selected, props.images, vs, store]);

  return (
    <Dialog
      open={props.open} 
      onOpenChange={onOpenChange}>
      <DialogContent 
        closeIcon={false}
        className="flex flex-col h-11/12 w-11/12 max-w-11/12 p-0 overflow-hidden relative">
        <DialogHeader className="flex flex-row justify-between border-b">
          <DialogTitle>
            Search Results
          </DialogTitle>

          <div className="flex">
            Search inside 
            <ToggleGroup
              type="single">
              <ToggleGroupItem value="this">
                this image
              </ToggleGroupItem>

              <ToggleGroupItem value="other">
                other images
              </ToggleGroupItem>

              <ToggleGroupItem value="all">
                all images
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </DialogHeader>

        <div className="grow relative">
          <Masonry 
            items={results}
            render={ImageSearchResult} />
        </div>
      </DialogContent>
    </Dialog>
  )

}