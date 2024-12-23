import { useState } from 'react';
import { CloudDownload } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { Input } from '@/ui/Input';

export const ImportIIIF = () => {

  const [url, setURL] = useState('');

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal">
          <CloudDownload className="size-5 pt-[1px]" /> Import IIIF
        </Button>
      </DialogTrigger>

      <DialogContent className="">
        <DialogTitle>
          Import IIIF
        </DialogTitle>
        
        <DialogDescription>
          Paste a IIIF Image URL
        </DialogDescription>

        <form 
          className="space-y-4"
          onSubmit={onSubmit}>
          <Input 
            autoFocus
            value={url}
            onChange={evt => setURL(evt.target.value)} />

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button 
                type="button"
                variant="ghost">
                Cancel
              </Button>
            </DialogClose>

            <Button>Import</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

}