import { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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

  const { t } = useTranslation('smartTools');

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
        {t('visualSearch.description')}
      </p>

      <div className="pt-3">
        {indexStatus.state === 'index_missing' ? (
          <Alert variant="destructive" className="rounded-sm py-1.5 px-2 leading-relaxed">
            <Trans
              ns="smartTools"
              i18nKey="visualSearch.notIndexed"
              components={{
                nowrap: <span />,
                icon: <Images className="size-3.5 inline-block" />,
                searchLink: <Link to="/visual-search" className="font-semibold hover:underline" />
              }} />
          </Alert>
        ) : selected.length === 1 ? (
          <div className="space-y-3 pt-1.5">
            <div>
              <Button 
                className="bg-orange-400 hover:bg-orange-400/90 w-full h-9 tracking-wide"
                onClick={onOpenSearchDialog}>
                {t('visualSearch.searchInsideImages')}
              </Button>

              <p className="font-light text-center py-1.5 px-2">
                {t('visualSearch.discoverSimilar')}
              </p>
            </div>
          </div>
        ) : (
          <p className="p-1.5 text-center font-light leading-relaxed rounded border border-dashed border-gray-500">
            {t('visualSearch.selectAnnotation')}
          </p>
        )}

        {indexStatus.state === 'index_incomplete' && (
          <div className="text-amber-600 mt-4 flex gap-1.5 items-start">
            <TriangleAlert className="inline size-4 shrink-0" /> 
            <p>
              <Trans
                ns="smartTools"
                i18nKey="visualSearch.indexOutdated"
                components={{
                  searchLink: <Link to="/visual-search" className="underline" />
                }} />
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