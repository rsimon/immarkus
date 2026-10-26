import { Trans, useTranslation } from 'react-i18next';
import { Cuboid, Sparkles, Spline } from 'lucide-react';
import { RelationsSelectionControl } from '@/components/AnnotationServices/FormComponents';
import { EntityType, RelationshipType } from '@/model';
import { AnnotationServiceOptions, ServiceRegistry } from '@/services';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
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

interface AutoAnnotateControlsProps {

  status: AnnotationServiceStatus;

  input: AnnotationServiceInput;

  options: AnnotationServiceOptions;

  entityTags: EntityType[];

  relations: RelationshipType[];

  onConnectorChanged(connectorId: string): void;

  onServiceOptionChanged(key: string, value: any): void;

  onEntityTagsChanged(tags: EntityType[]): void;

  onRelationsChanged(relations: RelationshipType[]): void;

  onCancel(): void;

  onSubmit(): void;

}

const connectors = ServiceRegistry.listAvailableConnectors('ANNOTATION');

export const AutoAnnotateControls = (props: AutoAnnotateControlsProps) => {

  const { t } = useTranslation('smartTools');

  const model = useDataModel();

  const { 
    canSubmit,
    connectorConfig, 
    serviceConfig, 
    parameters 
  } = useAnnotationServiceConfig('ANNOTATION', props.options, props.input);

  const showProcessingState = useIsProcessing(props.status, props.options);

  const readyToSubmit = canSubmit && props.entityTags.length > 0;

  const onSetAllEntityTypes = () => 
    props.onEntityTagsChanged(model.entityTypes);

  const onSetAllRelations = () =>
    props.onRelationsChanged(model.relationshipTypes);

  return (
    <div className="pr-2 py-4 pl-1 min-h-full flex flex-col">
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
              <Cuboid className="size-4" /> {t('annotate.controls.entityTags')}
            </Label>

            <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
              <Trans
                t={t}
                i18nKey="autoAnnotate.controls.entityTagsHint" 
                components={{
                  selectAll: (
                    <span
                      role="button"
                      tabIndex={0}
                      className="font-medium underline text-foreground" 
                      onClick={onSetAllEntityTypes}
                      onKeyDown={evt => {
                        if (evt.key === 'Enter' || evt.key === ' ') {
                          evt.preventDefault();
                          onSetAllEntityTypes();
                        }
                    }}/>
                  )
                }}/>
            </p>

            <TagSelectionControl
              selectedTags={props.entityTags} 
              onChangeSelectedTags={props.onEntityTagsChanged} />
          </fieldset>

          <fieldset className="space-y-2 mt-6">
            <Label className="font-semibold flex gap-1.5 items-center">
              <Spline className="size-4" />  {t('autoAnnotate.controls.relations')}
            </Label>

            <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
              <Trans
                t={t}
                i18nKey="autoAnnotate.controls.relationsHint" 
                components={{
                  selectAll: (
                    <span
                      role="button"
                      tabIndex={0}
                      className="font-medium underline text-foreground" 
                      onClick={onSetAllRelations}
                      onKeyDown={evt => {
                        if (evt.key === 'Enter' || evt.key === ' ') {
                          evt.preventDefault();
                          onSetAllRelations();
                        }
                    }}/>
                  )
                }}/>
            </p>
            
            <RelationsSelectionControl
              relations={props.relations}
              onChange={props.onRelationsChanged} />
          </fieldset>
        </form>
      </div>

      <div className="space-y-2 pt-8">
        {showProcessingState ? (
          <ProcessingStateBadge
            lastError={props.status?.error}
            processingState={props.status?.state} />
        ) : (
          <Button 
            className="w-full flex gap-2 1.5"
            onClick={() => props.onSubmit()}
            disabled={!readyToSubmit}>
            <Sparkles className="size-4" /> {t('autoAnnotate.controls.runAnnotation')}
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