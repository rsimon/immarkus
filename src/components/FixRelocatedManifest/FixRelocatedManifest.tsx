import { useState } from 'react';
import { DropdownMenuItem } from '@/ui/DropdownMenu';
import { IIIFManifestResource } from '@/model';
import { useFixRelocatedManifest } from './useFixedRelocatedManifest';
import { Dialog, DialogContent } from '@/ui/Dialog';

interface FixRelocatedManifestProps {

  manifest: IIIFManifestResource

}

export const FixRelocatedManifest = (props: FixRelocatedManifestProps) => {

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
        Fix Relocated Manifest
      </DropdownMenuItem>

      <Dialog
        open={isRepairDialogOpen}
        onOpenChange={open => setIsRepairDialogOpen(open)}>
        <DialogContent>
          <input 
            value={newUrl}
            onChange={evt => setNewUrl(evt.target.value) }/>
          <button onClick={() => onRepair()}>Ok</button>
        </DialogContent>
      </Dialog>
    </>
  )

}