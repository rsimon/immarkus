import { useEffect, useState } from 'react';
import { ServiceRegistry } from './ServiceRegistry';
import { 
  AnnotationServiceConfig,
  AnnotationServiceConnector, 
  ServiceConnector, 
  ServiceConnectorConfig, 
  ServiceType, 
  TranslationServiceConnector,
  TranslationServiceConfig,
  TranscriptionServiceConfig,
  TranscriptionServiceConnector,
  ServiceConfig
} from './Types';

interface ServiceTypeMap {

  ANNOTATION: { config: AnnotationServiceConfig; connector: AnnotationServiceConnector };

  TRANSLATION: { config: TranslationServiceConfig; connector: TranslationServiceConnector };
  
  TRANSCRIPTION: { config: TranscriptionServiceConfig; connector: TranscriptionServiceConnector };

}

type UseServiceResult<T extends keyof ServiceTypeMap> = {

  connectorConfig?: ServiceConnectorConfig;

  serviceConfig?: ServiceTypeMap[T]['config'];

  connector?: ServiceTypeMap[T]['connector'];

};

type UseServiceState = {

  connectorConfig: ServiceConnectorConfig | undefined;

  serviceConfig: ServiceConfig | undefined;
  
  connector: ServiceConnector | undefined;

};

const EMPTY_STATE: UseServiceState = { 
  
  connectorConfig: undefined, 
  
  serviceConfig: undefined,

  connector: undefined

};

export function useService<T extends keyof ServiceTypeMap>(
  connectorId: string,
  type: T
): UseServiceResult<T>;

export function useService<C extends ServiceConfig>(
  connectorId: string,
  config: C
): UseServiceResult<C['type'] & keyof ServiceTypeMap>;

export function useService(
  connectorId: string,
  arg: ServiceType | ServiceConfig
): UseServiceResult<keyof ServiceTypeMap>  {
  const type = typeof arg === 'string' ? arg : arg.type;
  const key = `${connectorId}:${type}:${typeof arg === 'string' ? '' : JSON.stringify(arg)}`;

  const [state, setState] = useState<UseServiceState & { key: string }>({
    key,
    ...EMPTY_STATE
  });

  useEffect(() => {
    let cancelled = false;

    const connectorConfig = ServiceRegistry.getConnectorConfig(connectorId);
    if (!connectorConfig)
      throw new Error(`Unknown connector: ${connectorId}`);

    if (!connectorConfig.services.some(s => s.type === type))
      throw new Error(`Connector ${connectorId} does not support service type ${type}`);

    const serviceConfig =
      typeof arg === 'string'
        ? connectorConfig.services.find(s => s.type === type)!
        : arg;

    ServiceRegistry.getConnector(connectorId, type)
      .then(connector => {
        if (!cancelled)
          setState({ key, connectorConfig, serviceConfig, connector });
      })
      .catch(error => {
        if (!cancelled)
          console.error(error);
      });

    return () => { cancelled = true; };
  }, [key]);

  return (state.key === key ? state : EMPTY_STATE) as UseServiceResult<keyof ServiceTypeMap>;

}