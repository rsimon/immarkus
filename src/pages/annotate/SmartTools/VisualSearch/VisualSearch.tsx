import { useState } from 'react';
import { useSelection } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { Button } from '@/ui/Button';
import { useVisualSearch } from '@/pages/visualsearch/useVisualSearch';
import { ImageSearchDialog } from './ImageSearchDialog';
import { Alert } from '@/ui/Alert';
import { Link } from 'react-router-dom';
import { Images, TriangleAlert } from 'lucide-react';

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
    <div className="px-3">
      <p className="pt-4 font-medium leading-relaxed">
        Search your collection for visually similar elements.
      </p>

      <div className="pt-3">
        {indexStatus === 'index_missing' ? (
          <Alert variant="destructive" className="rounded-sm py-1.5 px-2 leading-relaxed">
            Your collection is not indexed. Go 
            to <span><Images className="size-3.5 inline-block" /> <Link to="/visual-search" className="font-semibold hover:underline">Visual Search</Link></span> to learn more.
          </Alert>
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

        {indexStatus === 'index_incomplete' && (
          <div className="text-amber-600 mt-4 flex gap-1.5 items-start">
            <TriangleAlert className="inline size-4 shrink-0" /> 
            <p>
              Your search index is outdated. Go 
              to <Link to="/visual-search" className="underline">Visual Search</Link> to learn more.
            </p>
          </div>
        )}
      </div>

      <ImageSearchDialog 
        images={props.images}
        open={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)} />
    </div>
  )

}