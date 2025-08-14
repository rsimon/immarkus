import { Check } from 'lucide-react';
import { cn } from '@/ui/utils';
import { BASE_LANGUAGES } from './Languages';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/ui/Command';

interface LanguagesTabProps {

  language: string;

  onChangeLanguage(language: string): void;

}

const label = new Intl.DisplayNames(['en'], { type: 'language' });

export const LanguagesTab = (props: LanguagesTabProps) => {

  return (
    <Command>
      <CommandInput 
        placeholder="Search language..." 
        className="h-9" />

      <CommandList>
        <CommandEmpty>No supported language found.</CommandEmpty>

        <CommandGroup>
          {BASE_LANGUAGES.map(iso => (
            <CommandItem
              key={iso}
              value={iso}
              className="cursor-pointer"
              onSelect={props.onChangeLanguage}>
              {label.of(iso)}
              <Check className={cn('ml-auto', iso === props.language ? 'opacity-100' : 'opacity-0')} />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>  
  )

}