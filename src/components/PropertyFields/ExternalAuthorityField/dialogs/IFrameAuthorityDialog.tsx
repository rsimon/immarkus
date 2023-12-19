import { ReactNode } from 'react';
import { ExternalAuthorityPropertyDefinition } from '@/model';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { Input } from '@/ui/Input';
import { ExternalAuthority } from '@/model/ExternalAuthority';
import { Spinner } from '@/components/Spinner';

interface IFrameAuthorityDialogProps {

  children: ReactNode;

  authority: ExternalAuthority;

} 

export const IFrameAuthorityDialog = (props: IFrameAuthorityDialogProps) => {

  const { authority } = props;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>

      <DialogContent className="p-4 max-w-2xl rounded-lg">
        <div className="pr-8">
          <Input />
        </div>

        <div className="relative border rounded h-[70vh] bg-muted">
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
            <Spinner className="w-8 h-8 text-muted-foreground" />
          </div>

          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src={authority.url_pattern.replace('{{query}}', 'taiwan')} />
        </div>
      </DialogContent>
    </Dialog>
  )

}