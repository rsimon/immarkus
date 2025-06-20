import { ServiceConnector } from './Types';
import { Services } from './Services';

export const createServiceRegistry = () => {

  const connectors = new Map<string, ServiceConnector>();

  const loadingPromises = new Map<string, Promise<ServiceConnector>>();

  const listAvailableServices = () => [...Services];

  const getServiceConfig = (serviceId: string) => Services.find(s => s.id === serviceId);
  
  const getConnector = (serviceId: string): Promise<ServiceConnector> => {
    if (connectors.has(serviceId))
      return Promise.resolve(connectors.get(serviceId));

    if (loadingPromises.has(serviceId))
      return loadingPromises.get(serviceId);

    const serviceConfig = Services.find(s => s.id === serviceId);
    if (!serviceConfig)
      return Promise.reject(`Service not available: ${serviceId}`);

    const loadingPromise: Promise<ServiceConnector> = 
      import(`./connectors/${serviceConfig.connector}/index.ts`).then(m => m.default);

    loadingPromises.set(serviceId, loadingPromise);

    return loadingPromise.then(connector => {
      connectors.set(serviceId, connector);
      loadingPromises.delete(serviceId);
      return connector;
    }).catch(error => {
      loadingPromises.delete(serviceId);
      throw error;
    });
  }

  return {
    getConnector,
    getServiceConfig,
    listAvailableServices
  }
}

export const ServiceRegistry = createServiceRegistry();