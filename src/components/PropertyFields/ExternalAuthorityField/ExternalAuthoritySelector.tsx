import { useState } from 'react';
import { Search } from 'lucide-react';
import { ExternalAuthority } from '@/model';
import { IFrameAuthorityDialog } from './dialogs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface ExternalAuthoritySelectorProps {

  authorities: ExternalAuthority[];

  onCloseDialog(identifier?: string): void;

}

export const ExternalAuthoritySelector = (props: ExternalAuthoritySelectorProps) => {

  const { authorities } = props; 

  const [value, setValue] = useState(authorities.length > 0 ? authorities[0].name : undefined);

  const [open, setOpen] = useState<ExternalAuthority | undefined>();

  const onOpen = (name: string) => {
    setValue(name);
    setOpen(authorities.find(a => a.name === name));
  }

  const onClose = (identifier?: string) => {
    setOpen(undefined);
    props.onCloseDialog(identifier);
  }

  return ( 
    <>
     {authorities.length === 1 ? (
        <button 
          onClick={() => onOpen(authorities[0].name)}
          className="text-xs inline-flex items-center hover:bg-slate-200 px-1.5 rounded font-medium
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0">
          <Search className="h-3.5 w-3.5 mr-1" />
          {authorities[0].name}
        </button>
      ) : authorities.length > 1 ? (
        <Select 
          value={value}
          onValueChange={onOpen}>
          <div 
            role="button"
            className="flex items-center text-xs rounded-md mr-1.5 relative -top-[1px]">
            
            <button 
              onClick={() => onOpen(value)}
              className="text-[12px] flex items-center hover:bg-muted px-1.5 py-1 -mr-0.5 rounded
                outline-black/70 -outline-offset-[3px]">
              <Search className="h-3 w-3 mr-1" /> <SelectValue className="pr-0" />
            </button>       

            <SelectTrigger
              className="text-black shadow-none flex border-none pr-1 -ml-1 pl-0 py-1 bg-transparent hover:bg-muted 
                outline-black/70 -outline-offset-[2px] h-auto"/>
          </div>
          
          <SelectContent
            align="end" 
            alignOffset={-14}>

            {authorities.map(authority => (
              <SelectItem 
                key={authority.name} 
                value={authority.name}
                className="text-xs">
                {authority.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {open && (
        <IFrameAuthorityDialog 
          authority={open} 
          onClose={onClose} />
      )}
    </>
  )

}