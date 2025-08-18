import { Check } from 'lucide-react';
import { BASE_LANGUAGES } from './Languages';
import { 
  Command, 
  CommandEmpty, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/ui/Command';

import './LanguagesTab.css';

interface LanguagesTabProps {

  language: string;

  onChangeLanguage(language: string): void;

}

export const LanguagesTab = (props: LanguagesTabProps) => {

  return (
    <Command>
      <div className="p-1.5 border-b">
        <div className="language-filter bg-muted/70 rounded">
          <CommandInput 
            placeholder="Search language..." 
            className="text-xs" />
        </div>
      </div>

      <CommandList 
        className="p-1.5">
        <CommandEmpty>No supported language found.</CommandEmpty>
        {BASE_LANGUAGES.map(({ iso, label}) => (
          <CommandItem
            key={iso}
            value={`${iso} ${label}`}
            className="cursor-pointer text-xs py-2"
            onSelect={() => props.onChangeLanguage(iso)}>
            {iso === props.language ? (
              <Check className="size-4 mr-2"/>
            ) : (
              <div className="size-4 mr-2" />
            )}
            
            {label}
          </CommandItem>
        ))}
      </CommandList>
    </Command>  
  )

}