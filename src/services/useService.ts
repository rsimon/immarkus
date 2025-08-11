import { useEffect, useMemo, useState } from 'react';
import { ServiceRegistry } from './ServiceRegistry';
import { 
  ServiceConnector, 
  ServiceConnectorConfig, 
  ServiceType, 
  TranscriptionServiceConfig, 
  TranscriptionServiceConnector, 
  TranslationServiceConfig, 
  TranslationServiceConnector
} from './Types';

export function useService(
  connectorId: string,
  type: 'TRANSCRIPTION'
): { 
  connectorConfig: ServiceConnectorConfig; 
  serviceConfig: TranscriptionServiceConfig; 
  connector: TranscriptionServiceConnector; 
};

export function useService(
  connectorId: string,
  type: 'TRANSLATION'
): { 
  connectorConfig: ServiceConnectorConfig; 
  serviceConfig: TranslationServiceConfig; 
  connector: TranslationServiceConnector; 
};

export function useService(connectorId: string, type: ServiceType) {

  const { connectorConfig, serviceConfig } = useMemo(() => {
    const connectorConfig = ServiceRegistry.getConnectorConfig(connectorId);
    if (!connectorConfig)
      throw new Error(`Unknown connector: ${connectorId}`);

    if (!connectorConfig.services.some(s => s.type === type))
      throw new Error(`Connector ${connectorId} does not support service type ${type}`);

    const serviceConfig = connectorConfig.services.find(s => s.type === type);
    return { connectorConfig, serviceConfig };
  }, [connectorId, type]);
  
  const [connector, setConnector] = useState<ServiceConnector>();

  useEffect(() => {
    ServiceRegistry.getConnector(connectorId, type).then(setConnector);
  }, [connectorId, type]);

  return { connectorConfig, serviceConfig, connector };

}