import { ServiceConnector, ServiceType } from './Types';
import { Connectors } from './Connectors';

export const createServiceRegistry = () => {

  const connectors = new Map<string, ServiceConnector>();

  const loadingPromises = new Map<string, Promise<ServiceConnector>>();

  const getConnectorConfig = (connectorId: string) => Connectors.find(s => s.id === connectorId);

  const listAvailableConnectors = (service?: ServiceType) =>
    service 
      ? [...Connectors].filter(c => c.services.some(s => s.type === service))
      : [...Connectors];
  
  const getConnector= (connectorId: string, type: ServiceType): Promise<ServiceConnector> => {
    if (connectors.has(connectorId))
      return Promise.resolve(connectors.get(connectorId));

    if (loadingPromises.has(connectorId))
      return loadingPromises.get(connectorId);

    const connectorConfig = Connectors.find(s => s.id === connectorId);
    if (!connectorConfig)
      return Promise.reject(`Unknown service connector: ${connectorId}`);

    const loadingPromise: Promise<ServiceConnector> = 
      import(`./connectors/${connectorConfig.connector}/index.ts`).then(m => m.default);

    loadingPromises.set(connectorId, loadingPromise);

    return loadingPromise.then(connector => {
      connectors.set(connectorId, connector);
      loadingPromises.delete(connectorId);
      return connector;
    }).catch(error => {
      loadingPromises.delete(connectorId);
      throw error;
    });
  }

  return {
    getConnector,
    getConnectorConfig,
    listAvailableConnectors
  }
}

export const ServiceRegistry = createServiceRegistry();