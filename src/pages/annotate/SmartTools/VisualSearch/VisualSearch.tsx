import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Images, TriangleAlert } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { Alert } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { useVisualSearch } from '@/utils/useVisualSearch';
import { ImageSearchDialog } from './ImageSearchDialog';

interface VisualSearchProps {

  images: LoadedImage[];

}

export const VisualSearch = (props: VisualSearchProps) => {

  const vs = useVisualSearch();

  const { selected } = useSelection<ImageAnnotation>();

  const [frozenSelection, setFrozenSelection] = useState<typeof selected[0] | null>(null);

  const { indexStatus } = useVisualSearch();

  const sourceImage = useMemo(() => {
    if (!frozenSelection) return;
    return props.images.find(i => i.id === frozenSelection.annotatorId)
  }, [props.images.map(i => i.id).join(''), frozenSelection?.annotatorId]);

  // Freeze the selection at the time the dialog opens
  const onOpenSearchDialog = () => setFrozenSelection(selected[0]);

  const onCloseDialog = useCallback(() => {
    setFrozenSelection(null)
  }, []);

  return (
    <div className="px-4">
      <p className="pt-4 font-medium leading-relaxed text-center">
        Search your collection for visually similar elements.
      </p>

      <div className="pt-3">
        {indexStatus.state === 'index_missing' ? (
          <Alert variant="destructive" className="rounded-sm py-1.5 px-2 leading-relaxed">
            Your collection is not indexed. Go 
            to <span><Images className="size-3.5 inline-block" /> <Link to="/visual-search" className="font-semibold hover:underline">Visual Search</Link></span> to learn more.
          </Alert>
        ) : selected.length === 1 ? (
          <div className="space-y-3 pt-1.5">
            <div>
              <Button 
                className="bg-orange-400 hover:bg-orange-400/90 w-full h-9 tracking-wide"
                onClick={onOpenSearchDialog}>
                Search Inside Images
              </Button>

              <p className="font-light text-center py-1.5 px-2">
                Discover similar patterns across all images.
              </p>
            </div>
          </div>
        ) : (
          <p className="p-1.5 text-center font-light leading-relaxed rounded border border-dashed border-gray-500">
            Select an annotation to start.
          </p>
        )}

        {indexStatus.state === 'index_incomplete' && (
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
        vs={vs}
        selected={frozenSelection?.annotation}
        sourceImage={sourceImage}
        imagesInWorkspace={props.images}
        open={Boolean(frozenSelection)}
        onClose={onCloseDialog} />
    </div>
  )

}