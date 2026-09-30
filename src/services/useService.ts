import { useEffect, useState } from 'react';
import { ServiceRegistry } from './ServiceRegistry';
import { 
  AnnotationServiceConfig,
  AnnotationServiceConnector, 
  ServiceConnector, 
  ServiceConnectorConfig, 
  ServiceType, 
  TranslationServiceConnector,
  TranslationServiceConfig
} from './Types';

type UseServiceState =
  | {
      connectorConfig: ServiceConnectorConfig | undefined;
      serviceConfig: AnnotationServiceConfig | TranslationServiceConfig | undefined;
      connector: ServiceConnector | undefined;
    };

const EMPTY_STATE: UseServiceState = { 
  
  connectorConfig: undefined, 
  
  serviceConfig: undefined,

  connector: undefined

};

export function useService(
  connectorId: string,
  type: ServiceType
): { 
  connectorConfig: ServiceConnectorConfig; 
  serviceConfig: AnnotationServiceConfig; 
  connector?: AnnotationServiceConnector; 
};

export function useService(
  connectorId: string,
  config: AnnotationServiceConfig
): { 
  connectorConfig: ServiceConnectorConfig; 
  serviceConfig: AnnotationServiceConfig; 
  connector?: AnnotationServiceConnector; 
};

export function useService(
  connectorId: string,
  config: TranslationServiceConfig
): { 
  connectorConfig: ServiceConnectorConfig; 
  serviceConfig: TranslationServiceConfig; 
  connector?: TranslationServiceConnector; 
};

export function useService(
  connectorId: string,
  arg: ServiceType | AnnotationServiceConfig | TranslationServiceConfig
): {
  connectorConfig: ServiceConnectorConfig;
  serviceConfig: AnnotationServiceConfig | TranslationServiceConfig;
  connector?: ServiceConnector;
} {
  const type = typeof arg === 'string' ? arg : arg.type;

  const [state, setState] = useState<UseServiceState>(EMPTY_STATE);

  useEffect(() => {
    setState(EMPTY_STATE);

    const connectorConfig = ServiceRegistry.getConnectorConfig(connectorId);
    if (!connectorConfig)
      throw new Error(`Unknown connector: ${connectorId}`);

    if (!connectorConfig.services.some(s => s.type === type))
      throw new Error(`Connector ${connectorId} does not support service type ${type}`);

    const serviceConfig =
      typeof arg === 'string'
        ? connectorConfig.services.find(s => s.type === type)!
        : arg;

    ServiceRegistry.getConnector(connectorId, type).then(connector =>
      setState({ connectorConfig, serviceConfig, connector }));
  }, [connectorId, type, JSON.stringify(arg)]);

  return state;
}