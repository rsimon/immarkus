import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownWideNarrow, Search, Square, SquareCheckBig, SquareDot, X } from 'lucide-react';
import { LoadedImage } from '@/model';
import { cn } from '@/ui/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import { Label } from '@/ui/Label';
import { Button } from '@/ui/Button';
import { Separator } from '@/ui/Separator';
import { useDebounce } from '@/utils/useDebounce';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { SidebarImageItem } from './SidebarImageItem';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Input } from '@/ui/Input';

interface SidebarProps {

  sourceImageId: string;

  imagesInWorkspace: LoadedImage[];

  results: ResolvedSearchResult[];

  selectedImages: Set<string>;

  onSetSelectedImages: Dispatch<SetStateAction<Set<string>>>;

  currentPreview?: string;

  onTogglePreview(image?: LoadedImage): void;

}

type ResultSorting = 'hits' | 'score';

export const Sidebar = (props: SidebarProps) => {

  const { selectedImages } = props;

  const [sorting, setSorting] = useState<ResultSorting>('score');

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);

  const distinctImages = useMemo(() => {
    // Collect images into a list, in the order they first appear in `results`
    return props.results.reduce<LoadedImage[]>((distinct, result) => {
      if (distinct.some(i => i.id === result.imageId)) {
        return distinct;
      } else {
        return [...distinct, result.image];
      }
    }, []);
  }, [props.results]);

  const filteredImages = useMemo(() => debouncedSearch 
    ? distinctImages.filter(i => i.name.toLocaleLowerCase().includes(debouncedSearch))
    : distinctImages
  , [distinctImages, debouncedSearch]);

  useEffect(() => {
    // When results change -> select all
    props.onSetSelectedImages(new Set(filteredImages.map(i => i.id)));
  }, [filteredImages, props.onSetSelectedImages]);

  const { thisItem, otherItems } = useMemo(() => {
    const allItems = filteredImages.map(image => {
      const matches = props.results.filter(r => r.imageId === image.id).length;
      return { image, matches };
    });

    const thisItem = allItems.find(t => t.image.id === props.sourceImageId);
    const otherItems = allItems.filter(t => t.image.id !== props.sourceImageId);

    return { thisItem, otherItems };
  }, [props.results, filteredImages, props.sourceImageId]);

  const sortedOtherItems = useMemo(() => {
    if (sorting === 'hits') {
      return [...otherItems].sort((a, b) => b.matches - a.matches);
    } else {
      // Already sorted according to score
      return otherItems;
    }
  }, [otherItems, sorting]);

  const onToggleSelectAll = useCallback(() => {
    if (selectedImages.size === filteredImages.length)
      // All selected -> select none
      props.onSetSelectedImages(new Set());
    else
      props.onSetSelectedImages(new Set(filteredImages.map(i => i.id)));
  }, [selectedImages.size, filteredImages, props.onSetSelectedImages]);

  const onSetSelected = useCallback((image: LoadedImage, selected: boolean) => 
    props.onSetSelectedImages(current => {
      if (current.has(image.id) && !selected) {
        return new Set([...current].filter(id => id !== image.id));
      } else if (!current.has(image.id) && selected) {
        return new Set([...current, image.id]);
      } else {
        return current;
      }
    }), [props.onSetSelectedImages]);

  const isInWorkspace = useCallback((image: LoadedImage) => 
    props.imagesInWorkspace.some(i => i.id === image.id)
  , [props.imagesInWorkspace]);

  const getTopScore = useCallback((image: LoadedImage) => 
    props.results.find(r => r.imageId === image.id)?.score,
  [props.results]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between p-1 border-b">
        <Button
          variant="link"
          className="py-0 px-2 h-auto text-muted-foreground text-xs gap-1.5 hover:no-underline hover:text-primary"
          onClick={onToggleSelectAll}>
          {selectedImages.size === distinctImages.length ? (
            <SquareCheckBig className="size-4" />
          ) : selectedImages.size === 0 ? (
            <Square className="size-4" /> 
          ) : (
            <SquareDot className="size-4" />
          )}
          Select All
        </Button>

        <div className="flex items-center text-muted-foreground">
          <Popover
            open={searchOpen}
            onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                disabled={distinctImages.length < 2}
                variant="ghost"
                size="icon"
                className="size-7 relative">
                <Search className="size-3.5" />
         
                {search && (
                  <div className="size-2 border border-white rounded-full bg-orange-400 absolute top-1 right-1" />
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent 
              align="start"
              sideOffset={0}
              className="p-1 w-48 relative">
              <Input 
                value={search} 
                className="rounded-sm pr-8"
                onChange={e => setSearch(e.target.value)} 
                onKeyDown={e => (e.key === 'Enter') && setSearchOpen(false)} />

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 bottom-0 right-0 h-auto bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent"
                onClick={() => {
                  if (!search) setSearchOpen(false);
                  setSearch('');
                }}>
                <X className="size-4" />
              </Button>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-4 ml-1 mr-2" />

          <Label className="text-xs">
            <ArrowDownWideNarrow className="size-3.5" />
          </Label>

          <Select 
            value={sorting}
            onValueChange={v => setSorting(v as ResultSorting)}>
            <SelectTrigger
              className="pl-0 pr-0.5 border-none shadow-none font-medium text-xs hover:underline bg-transparent h-auto ml-1.5">
              <SelectValue />
            </SelectTrigger>
            
            <SelectContent>
              <SelectItem value="hits">
                Number of matches
              </SelectItem>

              <SelectItem value="score">
                Best match
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ul className="space-y-2 p-1 pt-2">
        {thisItem && (
          <li>
            <div 
              className={cn(
                'p-2 group hover:bg-blue-50/90 hover:border-blue-900/15 rounded cursor-pointer border border-transparent relative',
                thisItem.image.id === props.currentPreview && 'bg-blue-50 border border-blue-900/25'
              )}>
              <SidebarImageItem 
                isSourceImage
                isSelected={selectedImages.has(thisItem.image.id)}
                isPreviewOpen={Boolean(props.currentPreview)}
                isCurrentPreview={thisItem.image.id === props.currentPreview}
                image={thisItem.image} 
                topScore={getTopScore(thisItem.image)}
                matches={thisItem.matches} 
                onSetSelected={selected => onSetSelected(thisItem.image, selected)} 
                onTogglePreview={() => props.onTogglePreview(thisItem.image)} />
            </div>
          </li>
        )}
        {sortedOtherItems.map(({ image, matches }) => (
          <li 
            key={image.id}>
            <div className={cn(
              'p-2 group hover:bg-blue-50/90 hover:border-blue-900/15 border border-transparent rounded cursor-pointer relative overflow-hidden',
              image.id === props.currentPreview && 'bg-blue-50 border-blue-900/25'
              )}>
              <SidebarImageItem 
                isInWorkspace={isInWorkspace(image)}
                isSelected={selectedImages.has(image.id)}
                isPreviewOpen={Boolean(props.currentPreview)}
                isCurrentPreview={image.id === props.currentPreview}
                image={image} 
                topScore={getTopScore(image)}
                matches={matches} 
                onSetSelected={selected => onSetSelected(image, selected)} 
                onTogglePreview={() => props.onTogglePreview(image)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
  
}