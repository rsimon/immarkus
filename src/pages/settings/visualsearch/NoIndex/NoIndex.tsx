import { ChevronDown, PanelsTopLeft } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/ui/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/Collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';

interface NoIndexProps {

  imageCount: number;

  availableSegmenters: string[];

  selectedSegmenter: string;

  onStartIndexing(): void;

  onChangeSegmenter(url?: string): void;

}

const getModelName = (url: string) =>
  url.split('/').pop()?.replace(/\.onnx$/, '') ?? '';

export const NoIndex = (props: NoIndexProps) => {

  const { t } = useTranslation('settings');

  return (
    <div className="text-sm">    
      <div className="leading-relaxed space-y-3 mt-6 font-light">
        <p>
          <Trans
            ns="settings"
            i18nKey="noIndex.intro1"
            components={{
              b: <strong className="font-semibold" />,
              wsIcon: <PanelsTopLeft className="size-3.5 inline mb-0.5" strokeWidth={2.25} />
            }} />
        </p>

        <p>
          {t('noIndex.intro2')}
        </p>
      </div>

      <div className="flex flex-col mt-11 mb-2 gap-8">
        <div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => props.onStartIndexing()}>
            {t('noIndex.startButton', { count: props.imageCount })}
          </Button>

          {props.availableSegmenters.length > 1 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="link" className="px-0.5 mt-1 font-light group w-full flex justify-start gap-1">
                  {t('noIndex.advancedOptions')}
                  <ChevronDown 
                    className="size-4 group-data-[state=open]:rotate-180"/>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="rounded-md bg-muted p-4 text-xs">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="sm:self-center space-y-1">
                    <p className="font-medium text-foreground">{t('noIndex.segmentationModel')}</p>
                    <p className="text-muted-foreground">
                      {t('noIndex.segmentationModelDescription')}
                    </p>
                  </div>

                  <Select 
                    value={props.selectedSegmenter} 
                    onValueChange={props.onChangeSegmenter}>
                    <SelectTrigger className="w-full bg-background gap-1">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {props.availableSegmenters.map(url => (
                        <SelectItem key={url} value={url}>
                          {getModelName(url)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <p className="text-xs font-light text-muted-foreground leading-relaxed">
          {t('noIndex.footnote')}
        </p>
      </div>
    </div>
  )

}