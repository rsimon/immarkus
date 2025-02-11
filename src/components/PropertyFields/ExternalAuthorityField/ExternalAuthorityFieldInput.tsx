import { useRef } from 'react';
import { Pen } from 'lucide-react';
import { ExternalAuthority } from '@/model';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { formatIdentifier } from './util';

interface ExternalAuthorityFieldInputProps {

  authorities: ExternalAuthority[];

  className?: string;

  editable: boolean;

  value?: string;

  onChange(arg?: string): void;

  onSetEditable(editable: boolean): void;

}

export const ExternalAuthorityFieldInput = (props: ExternalAuthorityFieldInputProps) => {

  const isURI = props.value ? /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(props.value) : false;

  return props.editable ? (
    <Input
      autoFocus
      className={cn(props.className, 'mt-0.5')}
      value={props.value || ''} 
      onChange={evt => props.onChange(evt.target.value)} 
      onBlur={() => props.onSetEditable(!isURI)} />
  ) : (
    <div className={cn('flex h-9 w-full overflow-hidden shadow-xs bg-muted rounded-md border border-input pl-2.5 pr-1 items-center', props.className)}>
      <a 
        href={props.value} 
        className="grow text-sky-700 hover:underline overflow-hidden text-ellipsis pr-1"
        target="_blank">{formatIdentifier(props.value, props.authorities)}</a>

      <button 
        onClick={() => props.onSetEditable(true)}
        className="rounded-sm text-muted-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground">
        <Pen
          className="w-5.5 h-5.5 p-1 text-muted-foreground hover:text-black" />
      </button>
    </div>
  )
  
}