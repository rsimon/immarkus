import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { ExternalAuthority, ExternalAuthorityPropertyDefinition } from '@/model';
import { IFrameAuthorityDialog } from './dialogs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface ExternalAuthoritySelectorProps {

  definition: ExternalAuthorityPropertyDefinition;

  onCloseDialog(): void;

}

export const ExternalAuthoritySelector = (props: ExternalAuthoritySelectorProps) => {

  const authorities = props.definition.authorities || []; 

  const [value, setValue] = useState(authorities.length > 0 ? authorities[0].name : undefined);

  const [open, setOpen] = useState<ExternalAuthority | undefined>();

  const onOpen = (name: string) => {
    setValue(name);
    setOpen(authorities.find(a => a.name === name));
  }

  const onClose = () => {
    setOpen(undefined);
    props.onCloseDialog();
  }

  return ( 
    <>
     {authorities.length === 1 ? (
        <button 
          onClick={() => onOpen(authorities[0].name)}
          className="text-xs flex items-center hover:bg-slate-200 px-1.5 py-0.5 rounded font-medium
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0">
          <Search className="h-3.5 w-3.5 mr-1" />
          {props.definition.authorities[0].name}
        </button>
      ) : authorities.length > 1 ? (
        <Select 
          value={value}
          onValueChange={onOpen}>
          <div 
            role="button"
            className="flex items-center text-xs rounded-md hover:bg-muted">
            
            <button 
              onClick={() => onOpen(value)}
              className="text-xs flex items-center hover:bg-slate-200 px-1.5 py-1 pr-1.5 rounded font-medium
                focus:outline-none focus:ring-0 focus:ring-ring focus:ring-offset-0 focus-visible:outline-none 
                focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0">
              <Search className="h-3.5 w-3.5 mr-1" /> <SelectValue className="pr-0" />
            </button>       

            <SelectTrigger
              className="text-black border-none -ml-0.5 pr-1.5 pl-0.5 py-1 bg-transparent hover:bg-slate-200 focus:outline-none focus:ring-0 
                focus:ring-ring focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-ring focus-visible:ring-offset-2"/>
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