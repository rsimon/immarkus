import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { EntityType } from '@/model';
import { AnnotationServiceOptions, ServiceRegistry } from '@/services';
import { Label } from '@/ui/Label';
import { 
  AnnotationServiceInput, 
  AnnotationServiceStatus, 
  ServiceParameterControls, 
  ServiceSelectionControl, 
  TagSelectionControl, 
  useAnnotationServiceConfig 
} from '@/components/AnnotationServices';

interface AutoAnnotateControlsProps {

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

const connectors = ServiceRegistry.listAvailableConnectors('ANNOTATION');

export const AutoAnnotateControls = (props: AutoAnnotateControlsProps) => {

  const { t } = useTranslation('smartTools');

  const { 
    connectorConfig, 
    serviceConfig, 
    parameters 
  } = useAnnotationServiceConfig('ANNOTATION', props.options, props.input);

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

          <fieldset className="space-y-2 mt-6">
            <Label className="font-semibold flex gap-1.5 items-center">
              {t('annotate.controls.entityTags')}
            </Label>

            <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
              {t('autoAnnotate.controls.entityTagsHint')} 
            </p>

            <TagSelectionControl
              selectedTags={props.entityTags} 
              onChangeSelectedTags={props.onEntityTagsChanged} />
          </fieldset>
        </form>
      </div>
    </div>
  )

}