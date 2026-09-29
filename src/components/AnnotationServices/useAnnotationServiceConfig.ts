import { useMemo } from 'react';
import { AnnotationServiceOptions, ServiceConfigOf, ServiceRegistry, ServiceType } from '@/services';
import { AnnotationServiceInput } from './Types';

export const useAnnotationServiceConfig = <T extends ServiceType>(
  type: T, 
  options: AnnotationServiceOptions,
  input: AnnotationServiceInput
) => {
  const { connectorId, serviceOptions } = options;

  const { connectorConfig, serviceConfig } = useMemo(() => {
    const connectorConfig = ServiceRegistry.getConnectorConfig(connectorId);
    const serviceConfig = connectorConfig?.services.find(s => s.type === type) as ServiceConfigOf<typeof type>;
    return { connectorConfig, serviceConfig };
  }, [type, connectorId]);

  const parameters = useMemo(() => ([
    ...(connectorConfig?.parameters || []),
    ...(serviceConfig?.parameters || [])
  ]), [connectorConfig, serviceConfig]);

  const canSubmit = useMemo(() => {
    if (!serviceConfig) return false;

    // Check if all required params are filled
    const required = (parameters || []).filter(p => p.required);
    const allRequiredFilled = required.length === 0 || required.every(param => Boolean((serviceOptions || {})[param.id]));

    return serviceConfig.requiresRegion ? allRequiredFilled && Boolean(input.region) : allRequiredFilled;
  }, [serviceConfig, serviceOptions, parameters, input.region]);

  return { connectorConfig, serviceConfig, parameters, canSubmit };
}