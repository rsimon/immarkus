import { useState } from 'react';
import { ChevronDown, CloudCog, Globe } from 'lucide-react';
import { ServiceConnectorConfig } from '@/services';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/Tabs';
import { cn } from '@/ui/utils';
import { ServicesTab } from './services';
import { TranslationServiceSettings } from './Types';
import { LanguagesTab } from './languages';

interface TranslateSettingsPopoverProps {

  disabled?: boolean;

  language: string;

  onChangeLanguage(language: string): void;

  availableConnectors: ServiceConnectorConfig[];
  
  selectedService: TranslationServiceSettings;
  
  onChangeService(service: TranslationServiceSettings): void;

}

export const TranslateSettingsPopover = (props: TranslateSettingsPopoverProps) => {

  const [open, setOpen] = useState(false);

  return (
    <Popover 
      open={open} 
      onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn('flex items-center justify-center p-0 bg-transparent hover:text-accent-foreground outline-0', 
            props.disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
          <ChevronDown className="size-3.5" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-1.5" align="end">
        <Tabs defaultValue="service" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="service" className="flex items-center gap-2">
              <CloudCog className="size-4.5" />
              Services
            </TabsTrigger>

            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="size-4" />
              Language
            </TabsTrigger>
          </TabsList>

          <TabsContent value="service">
            <ServicesTab
              availableConnectors={props.availableConnectors}
              selected={props.selectedService}
              onChangeSelected={props.onChangeService} />
          </TabsContent>

          <TabsContent value="language">
            <LanguagesTab 
              language={props.language} 
              onChangeLanguage={props.onChangeLanguage} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}