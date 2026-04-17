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
    });
  }, [props.results]);

  return (
    <div className="p-2">
      <ul className="space-y-1.5">
        {items.map(({ image, matches }) => (
          <li 
            key={image.id}
            className="border p-1.5 rounded bg-white">
            <SidebarImageItem 
              isQueryImage={image.id === props.queryImageId}
              image={image} 
              matches={matches} 
              onOpenPreview={() => props.onOpenPreview(image)} />
          </li>
        ))}
      </ul>
    </div>
  )
  
}