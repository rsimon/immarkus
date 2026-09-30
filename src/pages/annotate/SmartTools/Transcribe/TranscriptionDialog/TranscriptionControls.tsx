import { useTranslation } from 'react-i18next';
import { CircleCheck, ScanText, Sparkles, SquareDashedMousePointer } from 'lucide-react';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
import { cn } from '@/ui/utils';
import { ServiceRegistry, AnnotationServiceOptions } from '@/services';
import { 
  AnnotationServiceInput, 
  AnnotationServiceStatus, 
  ProcessingStateBadge, 
  ServiceParameterControls, 
  ServiceSelectionControl, 
  TagSelectionControl, 
  useAnnotationServiceConfig,
  useIsProcessing
} from '@/components/AnnotationServices';

interface TranscriptionControlsProps {

  status: AnnotationServiceStatus;

  input: AnnotationServiceInput;

  options: AnnotationServiceOptions;

  entityTags: EntityType[];

  onConnectorChanged(connectorId: string): void;

  onServiceOptionChanged(key: string, value: any): void;

  onEntityTagsChanged(tags: EntityType[]): void;

  onCancel(): void;

  onSubmit(): void;

}

const connectors = ServiceRegistry.listAvailableConnectors('TRANSCRIPTION');

export const TranscriptionControls = (props: TranscriptionControlsProps) => {
  const { t } = useTranslation('smartTools');

  const { 
    connectorConfig, 
    serviceConfig, 
    parameters, 
    canSubmit 
  } = useAnnotationServiceConfig('TRANSCRIPTION', props.options, props.input);

  const showProcessingState = useIsProcessing(props.status, props.options);

  return (
    <div className="pr-2 py-4 min-h-full flex flex-col">
      <div className="space-y-8 flex-1">
        <ServiceSelectionControl 
          available={connectors}
          connectorConfig={connectorConfig}
          serviceConfig={serviceConfig}
          onConnectorChanged={props.onConnectorChanged} />

        <form 
          onSubmit={evt => evt.preventDefault()}
          className="space-y-4">
          
          <ServiceParameterControls
            connector={connectorConfig}
            parameters={parameters}
            values={props.options.serviceOptions}
            onChange={props.onServiceOptionChanged} />

          {serviceConfig.supportsEntityExtraction && (
            <fieldset className="space-y-2 mt-6">
              <Label className="font-semibold flex gap-1.5 items-center">
                <Sparkles className="size-4 text-muted-foreground mr-0.5" />
                <span>
                  {t('annotate.controls.entityTags')}
                </span>
                <span className="uppercase text-xs font-normal text-muted-foreground">{t('annotate.controls.optional')}</span>
              </Label>

              <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
               {t('transcribe.controls.entityTagsHint')} 
              </p>

              <TagSelectionControl 
                selectedTags={props.entityTags} 
                onChangeSelectedTags={props.onEntityTagsChanged} />
            </fieldset>
          )}
        </form>
      </div>

      <div className="space-y-2 pt-8">
        {serviceConfig.requiresRegion && (
          <div className={cn(
            'border rounded-md px-2.5 py-2 text-sm leading-relaxed',
            props.input.region 
              ? 'border-green-700/15 text-green-700 bg-green-700/10'
              : 'border-amber-700/15 text-amber-700 bg-amber-700/10'
            )}>
            <h5 className="font-semibold flex gap-2 items-center mb-1">
              {props.input.region ? (
                <>
                  <CircleCheck className="size-4.5 mb-0.5" />
                  {t('transcribe.controls.areaSelected')}
                </>
              ) : (
                <>
                  <SquareDashedMousePointer className="size-4.5 mb-0.5" />
                  {t('transcribe.controls.selectAreaToTranscribe')}
                </>
              )} 
            </h5>

            <p>
              {t('transcribe.controls.regionHint')}
            </p>
          </div>
        )}

        {showProcessingState ? (
          <ProcessingStateBadge
            lastError={props.status?.error}
            processingState={props.status?.state} />
        ) : (
          <Button 
            className="w-full flex gap-2 1.5"
            onClick={() => props.onSubmit()}
            disabled={!canSubmit}>
            {(props.entityTags.length === 0 || !serviceConfig.supportsEntityExtraction) ? (
              <>
                <ScanText className="size-4.5" /> {t('transcribe.controls.runTranscription')}
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> {t('transcribe.controls.transcribeAndExtractEntities')}
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={props.onCancel}>
          {t('annotate.controls.cancel')}
        </Button>
      </div>
    </div>
  )

}