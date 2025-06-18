import { useEffect, useMemo, useState } from 'react';
import { ServiceRegistry } from './ServiceRegistry';
import { ServiceConnector } from './Types';

export const useService = (serviceId: string) => {

  const config = useMemo(() => 
    ServiceRegistry.getServiceConfig(serviceId), [serviceId]);
  
  const [connector, setConnector] = useState<ServiceConnector>();

  useEffect(() => {
    ServiceRegistry.getConnector(serviceId).then(setConnector);
  }, [serviceId]);

  return { config, connector };

}