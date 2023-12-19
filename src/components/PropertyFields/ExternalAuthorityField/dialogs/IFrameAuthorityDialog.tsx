import { ReactNode, useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { Input } from '@/ui/Input';
import { ExternalAuthority } from '@/model/ExternalAuthority';
import { Spinner } from '@/components/Spinner';
import { useDebounce } from '@/utils/useDebounce';

interface IFrameAuthorityDialogProps {

  children: ReactNode;

  authority: ExternalAuthority;

} 

export const IFrameAuthorityDialog = (props: IFrameAuthorityDialogProps) => {

  const { authority } = props;

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState('');

  const [loading, setLoading] = useState(false);

  const debounced = useDebounce(query, 150);

  useEffect(() => {
    setQuery('');
    setLoading(false);
  }, [open]);

  useEffect(() => {
    if (debounced) 
      setLoading(true);
    else
      setLoading(false);
  }, [debounced]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>

      <DialogContent className="p-4 max-w-2xl rounded-lg gap-3">
        <DialogTitle>{authority.name}</DialogTitle>

        <Input
          className="mt-2"
          placeholder="Search..." 
          value={query}
          onChange={evt => setQuery(evt.target.value)} />

        <div className="relative border rounded-md h-[70vh] bg-muted">
          {!loading && !debounced && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
              <Database strokeWidth={0.5} className="w-32 h-32 text-slate-300" />
            </div>
          )}

          {loading && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
              <Spinner className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {debounced && (
            <iframe 
              style={{ opacity: loading ? 0 : 1}}
              className="absolute top-0 left-0 w-full h-full"
              onLoad={() => setLoading(false)}
              src={authority.url_pattern.replace('{{query}}', debounced)} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

}