import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownMenuItem } from '@/ui/DropdownMenu';
import { IIIFManifestResource } from '@/model';
import { useFixRelocatedManifest } from './useFixedRelocatedManifest';
import { Dialog, DialogContent } from '@/ui/Dialog';

interface FixRelocatedManifestProps {

  manifest: IIIFManifestResource

}

export const FixRelocatedManifest = (props: FixRelocatedManifestProps) => {

  const { t } = useTranslation('common');

  const { fixRelocatedManifest } = useFixRelocatedManifest();

  const [isRepairDialogOpen, setIsRepairDialogOpen] = useState(false);

  const [newUrl, setNewUrl] = useState(''); 

  const onRepair = () => fixRelocatedManifest(props.manifest, newUrl);

  return (
    <>
      <DropdownMenuItem onSelect={e => {
        e.preventDefault();
        setIsRepairDialogOpen(true)
      }}>
        {t('fixRelocatedManifest.menuItem')}
      </DropdownMenuItem>

      <Dialog
        open={isRepairDialogOpen}
        onOpenChange={open => setIsRepairDialogOpen(open)}>
        <DialogContent>
          <input 
            value={newUrl}
            onChange={evt => setNewUrl(evt.target.value) }/>
          <button onClick={() => onRepair()}>{t('fixRelocatedManifest.ok')}</button>
        </DialogContent>
      </Dialog>
    </>
  )

}