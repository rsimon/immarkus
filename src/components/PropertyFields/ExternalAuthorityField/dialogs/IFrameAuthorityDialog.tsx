import { useEffect, useRef, useState } from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/ui/Dialog';
import { Input } from '@/ui/Input';
import { ExternalAuthority } from '@/model/ExternalAuthority';
import { Spinner } from '@/components/Spinner';
import { useDebounce } from '@/utils/useDebounce';

interface IFrameAuthorityDialogProps {

  authority: ExternalAuthority;

  onClose(identifier?: string): void;

} 

export const IFrameAuthorityDialog = (props: IFrameAuthorityDialogProps) => {

  const iframe = useRef<HTMLIFrameElement>();

  const { authority } = props;

  const [query, setQuery] = useState('');

  const [loading, setLoading] = useState(false);

  const debounced = useDebounce(query, 150);

  useEffect(() => {
    const onMessage = (evt: MessageEvent) => {
      const { data } = evt;
      if (data) {
        if (authority.canonical_id_pattern)
          props.onClose(authority.canonical_id_pattern.replace('{{id}}', data));
        else
          props.onClose(data);
      }
    }

    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    }
  }, []);

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
    <Dialog open={Boolean(props.authority)} onOpenChange={() => props.onClose()}>
      <DialogContent className="p-4 max-w-2xl rounded-lg gap-3">
        <DialogTitle>{authority.name}</DialogTitle>
        <DialogDescription className="text-xs">
          {authority.description}
        </DialogDescription>

        <div className="relative mt-2">
          <Input
            className="h-9"
            placeholder={`Search ${authority.name}...`} 
            value={query}
            onChange={evt => setQuery(evt.target.value)} />

          <span 
            className="absolute top-0 right-0 h-full bg-muted border rounded-r">
            {debounced ? (
              <a 
                className="px-4 h-full flex items-center 
                hover:bg-slate-200/80 hover:disabled:bg-muted"
                href={(authority.external_url_pattern || authority.search_pattern).replace('{{query}}', debounced)}
                target="_blank">
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <div className="px-4 h-full flex items-center">
                <ExternalLink className="h-4 w-4 text-muted-foreground/60" />
              </div>
            )}
          </span>
        </div>

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
              ref={iframe}
              style={{ opacity: loading ? 0 : 1}}
              className="absolute top-0 left-0 w-full h-full"
              onLoad={() => setLoading(false)}
              src={authority.search_pattern.replace('{{query}}', debounced)} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

}