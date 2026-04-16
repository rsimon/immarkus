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
import { Skeleton } from '@/ui/Skeleton';
import { Grid2X2, Grid3X3, Square, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { Separator } from '@/ui/Separator';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
import { ImageSearchLegend } from './ImageSearchLegend';

interface ImageSearchDialogProps {

  images: LoadedImage[];

  open: boolean;

  onClose(): void;

}

export interface ResolvedSearchResult extends SearchResult {

  image: LoadedImage;

}

type IconSize = 'lg' | 'md' | 'sm';

type SearchScope = 'all' | 'this' | 'other';

export const ImageSearchDialog = (props: ImageSearchDialogProps) => {

  const { selected } = useSelection();

  const store = useStore();

  const vs = useVisualSearch();

  const [searchScope, setSearchScope] = useState<SearchScope>('all');

  const [iconsSize, setIconSize] = useState<IconSize>('sm');

  const [querySnippet, setQuerySnippet] = useState<Blob | undefined>();

  const [results, setResults] = useState<ResolvedSearchResult[] | undefined>();

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
      setQuerySnippet(blob);

      vs.index.query(blob, null, { topK: 50 }).then(results => {
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
        className="flex flex-col gap-0 h-11/12 w-11/12 max-w-11/12 p-0 overflow-hidden relative">

        <DialogHeader className="flex flex-row justify-between border-b">
          <DialogTitle className="m-0 p-2">
            <div className="flex items-start gap-2">
              {querySnippet ? (
                <img
                  className="size-12 rounded-sm object-cover"
                  src={URL.createObjectURL(querySnippet)} />
              ) : (
                <Skeleton className="size-12 rounded-sm" />
              )}
              
              <div className="p-0.5 text-xs font-normal text-muted-foreground">
                {results ? (
                  <span>Showing {results.length} matches</span>
                ) : (
                  <span>Searching...</span>
                )}
              </div>
            </div>
          </DialogTitle>

          <ToggleGroup
            type="single"
            variant="outline"
            className="shadow-none! mb-0"
            value={searchScope}
            onValueChange={value => setSearchScope(value as SearchScope)}>
            <ToggleGroupItem 
              value="all"
              className="text-xs font-normal">
              All images
            </ToggleGroupItem>

            <ToggleGroupItem
              value="this"
              className="text-xs font-normal">
              This image only
            </ToggleGroupItem>

            <ToggleGroupItem 
              value="other"
              className="text-xs font-normal">
              Other images only
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex gap-1 items-center pr-2">
            <ToggleGroup 
              type="single"
              className="gap-1"
              value={iconsSize}
              onValueChange={value => setIconSize(value as IconSize)}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ToggleGroupItem value="sm" size="sm">
                      <Grid3X3 className="size-4" />
                    </ToggleGroupItem>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Small Thumbnails</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ToggleGroupItem value="md" size="sm">
                      <Grid2X2 className="size-4" />
                    </ToggleGroupItem>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Medium Thumbnails</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ToggleGroupItem value="lg" size="sm">
                      <Square className="size-4" />
                    </ToggleGroupItem>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Large Thumbnails</TooltipContent>
              </Tooltip>
            </ToggleGroup>

            <Separator orientation="vertical" className="h-4" />

            <Button
              variant="ghost"
              size="icon"
              onClick={props.onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grow relative">
          <div className="flex h-full">
            <div className="sticky top-0 w-48 shrink-0 self-start">
              {results && (
                <ImageSearchLegend 
                  queryImageId={selected[0]?.annotatorId}
                  results={results} />
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 border-l bg-muted">
              {results && (
              <Masonry 
                items={results}
                columnGutter={6}
                columnWidth={iconsSize === 'sm' ? 90 : iconsSize === 'md' ? 160 : 280}
                render={ImageSearchResult} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}