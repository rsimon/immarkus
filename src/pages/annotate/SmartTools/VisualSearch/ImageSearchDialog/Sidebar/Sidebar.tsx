import { useMemo } from 'react';
import { LoadedImage } from '@/model';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { THIS_IMAGE_COLOR } from '../ImageSearchPalette';
import { SidebarImageItem } from './SidebarImageItem';
import { cn } from '@/ui/utils';

interface SidebarProps {

  sourceImageId: string;

  imagesInWorkspace: LoadedImage[];

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

    const thisItem = allItems.find(t => t.image.id === props.sourceImageId);
    const otherItems = allItems.filter(t => t.image.id !== props.sourceImageId);

    return { thisItem, otherItems };
  }, [props.results, props.sourceImageId]);

  const isInWorkspace = (image: LoadedImage) => props.imagesInWorkspace.some(i => i.id === image.id);

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
                'p-2 group hover:bg-blue-50 hover:border-blue-900/25 rounded cursor-pointer border border-transparent relative',
                thisItem.image.id === props.currentPreview && 'bg-blue-50 border border-blue-900/25'
              )}>
              <SidebarImageItem 
                isSourceImage
                isCurrentPreview={thisItem.image.id === props.currentPreview}
                image={thisItem.image} 
                matches={thisItem.matches} 
                onTogglePreview={() => onTogglePreview(thisItem.image)} />

              <div 
                className="absolute top-1 right-1 rounded-xs text-[10px] text-white py-px px-1"
                style={{
                  backgroundColor: THIS_IMAGE_COLOR
                }}>
                Source Image
              </div>
            </div>
          </li>
        )}
        {otherItems.map(({ image, matches }) => (
          <li 
            key={image.id}>
            <div className={cn(
              'p-2 group hover:bg-muted rounded cursor-pointer relative',
              image.id === props.currentPreview && 'bg-muted'
              )}>
              <SidebarImageItem 
                isCurrentPreview={image.id === props.currentPreview}
                image={image} 
                matches={matches} 
                onTogglePreview={() => onTogglePreview(image)} />

              {isInWorkspace(image) && (
                <div 
                  className="absolute top-1 right-1 rounded-xs text-[10px] text-white bg-orange-400 py-px px-1">
                  Currently Open
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
  
}