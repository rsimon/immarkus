import { useEffect, useMemo, useState } from 'react';
import { ServiceRegistry } from './ServiceRegistry';
import { 
  ServiceConnector, 
  ServiceConnectorConfig, 
  ServiceType, 
  TranscriptionServiceConnector, 
  TranslationServiceConnector,
  TranscriptionServiceConfig,
  TranslationServiceConfig
} from './Types';

type UseServiceState =
  | {
      connectorConfig: ServiceConnectorConfig | undefined;
      serviceConfig: TranscriptionServiceConfig | TranslationServiceConfig | undefined;
      connector: ServiceConnector | undefined;
    };

const EMPTY_STATE: UseServiceState = { 
  
  connectorConfig: undefined, 
  
  serviceConfig: undefined,

  connector: undefined

};

export function useService(
  connectorId: string,
  type: 'TRANSCRIPTION'
): { 
  connectorConfig: ServiceConnectorConfig; 
  serviceConfig: TranscriptionServiceConfig; 
  connector?: TranscriptionServiceConnector; 
};

export function useService(
  connectorId: string,
  type: 'TRANSLATION'
): { 
  connectorConfig: ServiceConnectorConfig; 
  serviceConfig: TranslationServiceConfig; 
  connector?: TranslationServiceConnector; 
};

export function useService(
  connectorId: string,
  config: TranscriptionServiceConfig
): { 
  connectorConfig: ServiceConnectorConfig; 
  serviceConfig: TranscriptionServiceConfig; 
  connector?: TranscriptionServiceConnector; 
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
  arg: ServiceType | TranscriptionServiceConfig | TranslationServiceConfig
): {
  connectorConfig: ServiceConnectorConfig;
  serviceConfig: TranscriptionServiceConfig | TranslationServiceConfig;
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
  }, [connectorId, type, arg]);

  return state;
}