import { useState } from 'react';
import { Bug } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Annotorious } from '@annotorious/react';
import { Dialog, DialogContent, DialogTitle } from '@/ui/Dialog';
import { useVisualSearchAvailable } from '@/utils/useVisualSearch';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/ui/DropdownMenu';
import { VisualSearchDebugViewer } from './VisualSearchDebugViewer';

interface VisualSearchDebugActionProps {

  title: string;

  imageId: string;

}

export const VisualSearchDebugAction = (props: VisualSearchDebugActionProps) => {
  const { t } = useTranslation('common');

  const hasVisualSearch = useVisualSearchAvailable();
  const [showVisualSearchDebug, setShowVisualSearchDebug] = useState(false);

  const onOpenVSDebug = (e: Event) => {
    e.preventDefault();
    setShowVisualSearchDebug(true);
  }

  if (!hasVisualSearch) {
    return null;
  }

  return hasVisualSearch ? (
    <>
      <DropdownMenuSeparator />

      <DropdownMenuItem onSelect={onOpenVSDebug}>
        <Bug className="size-4 mr-2 text-amber-500" />
        {t('visualSearchDebug.inspectIndexedPatches')}
      </DropdownMenuItem>


      <Dialog
        open={showVisualSearchDebug}
        onOpenChange={setShowVisualSearchDebug}>
        <DialogContent className="h-11/12 w-11/12 max-w-11/12 flex flex-col">
          <DialogTitle>
            {props.title}
          </DialogTitle>

          <div className="grow relative">
            <Annotorious>
              <VisualSearchDebugViewer
                imageId={props.imageId} />
            </Annotorious>
          </div>
        </DialogContent>
      </Dialog>
    </>
  ) : null;

}