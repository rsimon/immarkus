import { useState } from 'react';
import { ChevronDown, CloudCog, Globe } from 'lucide-react';
import { ServiceConnectorConfig } from '@/services';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/Tabs';
import { cn } from '@/ui/utils';
import { ServicesTab } from './services';
import { TranslationSettings } from './Types';
import { LanguagesTab } from './languages';

interface TranslateSettingsPopoverProps {

  disabled?: boolean;

  language: string;

  onChangeLanguage(language: string): void;

  availableConnectors: ServiceConnectorConfig[];
  
  selectedService: TranslationSettings;
  
  onChangeService(service: TranslationSettings): void;

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
      
      <PopoverContent 
        className="min-w-64 shadow-lg p-0" 
        collisionPadding={20}>
        <Tabs defaultValue="service" className="w-full">
          <TabsList 
            className="grid w-full grid-cols-2 p-1 h-auto bg-white rounded-b-none ">
            <TabsTrigger 
              value="service"
              className="flex border border-transparent text-xs p-2 font-normal items-center gap-2 opacity-50 data-[state=active]:bg-white data-[state=active]:opacity-100 data-[state=active]:border-input">
              <CloudCog className="size-4" />
              Services
            </TabsTrigger>

            <TabsTrigger 
              value="language" 
              className="flex border border-transparent text-xs p-2 font-normal items-center gap-2 opacity-50 data-[state=active]:bg-white data-[state=active]:opacity-100 data-[state=active]:border-input">
              <Globe className="size-3.5" />
              Language
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="service"
            className="mt-0">
            <ServicesTab
              availableConnectors={props.availableConnectors}
              selected={props.selectedService}
              onChangeSelected={props.onChangeService} />
          </TabsContent>

          <TabsContent 
            value="language"
            className="mt-0">
            <LanguagesTab 
              language={props.language} 
              onChangeLanguage={props.onChangeLanguage} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}