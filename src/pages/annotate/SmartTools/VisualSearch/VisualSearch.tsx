import { useState } from 'react';
import { useSelection } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { Button } from '@/ui/Button';
import { useVisualSearch } from '@/pages/visualsearch/useVisualSearch';
import { ImageSearchDialog } from './ImageSearchDialog';

interface VisualSearchProps {

  images: LoadedImage[];

}

export const VisualSearch = (props: VisualSearchProps) => {

  const { selected } = useSelection();

  const { indexStatus } = useVisualSearch();

  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const onSearchAnnotations = () => {
    console.warn('Not implemented');
  }

  return (
    <div className="px-4">
      <p className="pt-4 font-medium leading-relaxed">
        Search your collection for visually similar elements.
      </p>

      <div className="pt-5">
        {indexStatus === 'loading' ? (
          <div>Loding</div>
        ) : indexStatus === 'index_missing' ? (
          <div>No index - link to vs page</div>
        ) : selected.length === 1 ? (
          <div className="space-y-3">
            <div>
              <Button 
                className="bg-orange-400 hover:bg-orange-400/90 w-full h-9 tracking-wide"
                onClick={() => setIsSearchDialogOpen(true)}>
                Search Inside Images
              </Button>

              <p className="font-light text-center py-1.5 px-2">
                Discover similar patterns across all images.
              </p>
            </div>

            <div>
              <Button 
                disabled
                className="bg-orange-400 hover:bg-orange-400/90 w-full h-9 tracking-wide"
                onClick={onSearchAnnotations}>
                Search Annotations
              </Button>

              <p className="font-light text-center py-1.5 px-2">
                Find matches in your existing annotations.
              </p>
            </div>
          </div>
        ) : (
          <p className="p-1.5 text-center font-light leading-relaxed rounded border border-dashed border-gray-500">
            Select an annotation to start.
          </p>
        )}
      </div>

      <ImageSearchDialog 
        images={props.images}
        open={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)} />
    </div>
  )

}