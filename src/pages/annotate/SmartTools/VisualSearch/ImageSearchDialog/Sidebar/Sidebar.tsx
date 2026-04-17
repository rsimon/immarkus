import { useMemo } from 'react';
import { LoadedImage } from '@/model';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { SidebarImageItem } from './SidebarImageItem';
import { cn } from '@/ui/utils';

interface SidebarProps {

  queryImageId: string;

  results: ResolvedSearchResult[];

  currentPreview?: string;

  onSetPreview(image?: LoadedImage): void;

}

export const Sidebar = (props: SidebarProps) => {

  const items = useMemo(() => {
    const distinctImages = [...new Set(props.results.map(r => r.image))];
    
    return distinctImages.map(image => {
      const matches = props.results.filter(r => r.imageId === image.id).length;
      return { image, matches };
    }).sort((a, b) => b.matches - a.matches);
  }, [props.results]);

  const onTogglePreview = (image: LoadedImage) => {
    if (props.currentPreview === image.id)
      props.onSetPreview(undefined);
    else
      props.onSetPreview(image);
  }

  return (
    <div className="p-2 h-full overflow-y-auto">
      <ul className="space-y-1.5">
        {items.map(({ image, matches }) => (
          <li 
            key={image.id}>
            <div className={cn(
              'p-2 group hover:bg-muted rounded cursor-pointer',
              image.id === props.currentPreview && 'bg-muted'
              )}>
              <SidebarImageItem 
                isCurrentPreview={image.id === props.currentPreview}
                isQueryImage={image.id === props.queryImageId}
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