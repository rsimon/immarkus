import { useMemo } from 'react';
import { LoadedImage } from '@/model';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { THIS_IMAGE_COLOR } from '../ImageSearchPalette';
import { SidebarImageItem } from './SidebarImageItem';
import { cn } from '@/ui/utils';

interface SidebarProps {

  queryImageId: string;

  results: ResolvedSearchResult[];

  currentPreview?: string;

  onSetPreview(image?: LoadedImage): void;

}

export const Sidebar = (props: SidebarProps) => {

  const { thisItem, otherItems } = useMemo(() => {
    const distinctImages = [...new Set(props.results.map(r => r.image))];
    
    const allItems = distinctImages.map(image => {
      const matches = props.results.filter(r => r.imageId === image.id).length;
      return { image, matches };
    }).sort((a, b) => b.matches - a.matches);

    const thisItem = allItems.find(t => t.image.id === props.queryImageId);
    const otherItems = allItems.filter(t => t.image.id !== props.queryImageId);

    return { thisItem, otherItems };
  }, [props.results, props.queryImageId]);

  const onTogglePreview = (image: LoadedImage) => {
    if (props.currentPreview === image.id)
      props.onSetPreview(undefined);
    else
      props.onSetPreview(image);
  }

  return (
    <div className="p-2 h-full overflow-y-auto">
      <ul className="space-y-1.5">
        {thisItem && (
          <li>
            <div 
              className={cn(
                'p-2 group bg-blue-50 hover:bg-muted rounded cursor-pointer border relative',
                thisItem.image.id === props.currentPreview && 'bg-muted'
              )}
              style={{
                borderColor: THIS_IMAGE_COLOR
              }}>
              <SidebarImageItem 
                isQueryImage
                isCurrentPreview={thisItem.image.id === props.currentPreview}
                image={thisItem.image} 
                matches={thisItem.matches} 
                onTogglePreview={() => onTogglePreview(thisItem.image)} />

              <div 
                className="absolute top-1 right-1 rounded-xs text-[10px] text-white py-px px-1"
                style={{
                  backgroundColor: THIS_IMAGE_COLOR
                }}>
                This Image
              </div>
            </div>
          </li>
        )}
        {otherItems.map(({ image, matches }) => (
          <li 
            key={image.id}>
            <div className={cn(
              'p-2 group hover:bg-muted rounded cursor-pointer',
              image.id === props.currentPreview && 'bg-muted'
              )}>
              <SidebarImageItem 
                isCurrentPreview={image.id === props.currentPreview}
                image={image} 
                matches={matches} 
                onTogglePreview={() => onTogglePreview(image)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
  
}