import { useMemo } from 'react';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { SidebarImageItem } from './SidebarImageItem';

interface SidebarProps {

  queryImageId: string;

  results: ResolvedSearchResult[];

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
      <ul>
        {items.map(({ image, matches }) => (
          <li key={image.id}>
            <SidebarImageItem 
              isQueryImage={image.id === props.queryImageId}
              image={image} 
              matches={matches} />
          </li>
        ))}
      </ul>
    </div>
  )
  
}