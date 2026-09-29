import { EntityType } from '@/model';
import { AnnotationServiceOptions, ServiceRegistry } from '@/services';
import { 
  AnnotationServiceInput, 
  AnnotationServiceStatus, 
  ServiceParameterControls, 
  ServiceSelectionControl, 
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
        </form>
      </div>
    </div>
  )

}