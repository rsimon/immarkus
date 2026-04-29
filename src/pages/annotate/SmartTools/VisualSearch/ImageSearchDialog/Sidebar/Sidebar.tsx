import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { LoadedImage } from '@/model';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { SidebarImageItem } from './SidebarImageItem';
import { cn } from '@/ui/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import { Label } from '@/ui/Label';
import { Button } from '@/ui/Button';
import { Square, SquareCheckBig, SquareDot } from 'lucide-react';

interface SidebarProps {

  sourceImageId: string;

  imagesInWorkspace: LoadedImage[];

  results: ResolvedSearchResult[];

  selectedImages: Set<string>;

  onSetSelectedImages: Dispatch<SetStateAction<Set<string>>>;

  currentPreview?: string;

  onSetPreview(image?: LoadedImage): void;

}

type ResultSorting = 'hits' | 'score';

export const Sidebar = (props: SidebarProps) => {

  const { selectedImages } = props;

  const [sorting, setSorting] = useState<ResultSorting>('score');

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

  useEffect(() => {
    // When results change -> select all
    props.onSetSelectedImages(new Set(distinctImages.map(i => i.id)));
  }, [distinctImages, props.onSetSelectedImages]);

  const { thisItem, otherItems } = useMemo(() => {
    const allItems = distinctImages.map(image => {
      const matches = props.results.filter(r => r.imageId === image.id).length;
      return { image, matches };
    });

    const thisItem = allItems.find(t => t.image.id === props.sourceImageId);
    const otherItems = allItems.filter(t => t.image.id !== props.sourceImageId);

    return { thisItem, otherItems };
  }, [props.results, distinctImages, props.sourceImageId]);

  const sortedOtherItems = useMemo(() => {
    if (sorting === 'hits') {
      return [...otherItems].sort((a, b) => b.matches - a.matches);
    } else {
      // Already sorted according to score
      return otherItems;
    }
  }, [otherItems, sorting]);

  const onToggleSelectAll = () => {
    if (selectedImages.size === distinctImages.length)
      // All selected -> select none
      props.onSetSelectedImages(new Set());
    else
      props.onSetSelectedImages(new Set(distinctImages.map(i => i.id)));
  }

  const onSetSelected = (image: LoadedImage, selected: boolean) => 
    props.onSetSelectedImages(current => {
      if (current.has(image.id) && !selected) {
        return new Set([...current].filter(id => id !== image.id));
      } else if (!current.has(image.id) && selected) {
        return new Set([...current, image.id]);
      } else {
        return current;
      }
    });

  const isInWorkspace = (image: LoadedImage) => props.imagesInWorkspace.some(i => i.id === image.id);

  const getTopScore = (image: LoadedImage) => props.results.find(r => r.imageId === image.id)?.score;

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

        <div className="flex items-center">
          <Label className="text-muted-foreground text-xs">Sort by</Label>

          <Select 
            value={sorting}
            onValueChange={v => setSorting(v as ResultSorting)}>
            <SelectTrigger
              className="px-0.5 border-none shadow-none font-medium text-xs hover:underline bg-transparent h-auto ml-1.5">
              <SelectValue />
            </SelectTrigger>
            
            <SelectContent>
              <SelectItem value="hits">
                number of matches
              </SelectItem>

              <SelectItem value="score">
                best match
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
                onOpenInPreview={() => props.onSetPreview(thisItem.image)} />
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
                onOpenInPreview={() => props.onSetPreview(image)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
  
}