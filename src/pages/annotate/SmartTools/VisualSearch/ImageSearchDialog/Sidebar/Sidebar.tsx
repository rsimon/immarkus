import { useMemo } from 'react';
import { LoadedImage } from '@/model';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { SidebarImageItem } from './SidebarImageItem';

interface SidebarProps {

  queryImageId: string;

  results: ResolvedSearchResult[];

  onOpenPreview(image: LoadedImage): void;

}

export const Sidebar = (props: SidebarProps) => {

  const items = useMemo(() => {
    const distinctImages = [...new Set(props.results.map(r => r.image))];
    
    return distinctImages.map(image => {
      const matches = props.results.filter(r => r.imageId === image.id).length;
      return { image, matches };
    }).sort((a, b) => b.matches - a.matches);
  }, [props.results]);

  return (
    <div className="p-2 h-full overflow-y-auto">
      <ul className="space-y-1.5">
        {items.map(({ image, matches }) => (
          <li 
            key={image.id}>
            <div className="p-2 hover:bg-muted rounded cursor-pointer">
              <SidebarImageItem 
                isQueryImage={image.id === props.queryImageId}
                image={image} 
                matches={matches} 
                onOpenPreview={() => props.onOpenPreview(image)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
  
}