import { ServiceConnectorConfig, ServiceRegistry } from '@/services';
import { TranslationSettings } from './TranslateButton';

export const TRANSLATION_SERVICE_KEY = 'immarkus:annotate:translation-service';
export const TRANSLATION_LANGUAGE_KEY = 'immarkus:annotate:translation-language';

// Returns the persisted translation service (if any - and if correctly configured)
export const getPersistedTranslationService = (
  availableConnectors: ServiceConnectorConfig[]
): TranslationSettings | undefined => {
  const persistedSetting = localStorage.getItem(TRANSLATION_SERVICE_KEY);
  const [connectorId, indexString] = persistedSetting?.split('::') || [];

  const connector = availableConnectors.find(item => item.id === connectorId);
  const idx = Number(indexString);

  const persistedService = connector?.services.filter(service => service.type === 'TRANSLATION')[idx];

  if (persistedService && Number.isInteger(idx) && idx >= 0)
    return { 
      connector, // e.g. 'OpenRouter'
      service: persistedService,  // e.g. 'OpenRouter (Gemini 2.5 Flash Lite) config
      index: idx // e.g. 0 - for first available translate config (not ideal... used for storage)
    };
}

export const persistTranslationService = (settings: TranslationSettings) =>
  localStorage.setItem(TRANSLATION_SERVICE_KEY, `${settings.connector.id}::${settings.index}`);

export const isTranslationServiceConfigured = (connector: ServiceConnectorConfig) => {
  if (!connector.requiresKey) return true;

  const requiredParams = (connector.parameters || []).filter(param => param.required);
  return requiredParams.length > 0
    && requiredParams.every(param => param.type === 'credential'
      && localStorage.getItem(`immarkus:services:${connector.id}:${param.id}`));
}

export const getAvailableTranslationConnectors = () =>
  ServiceRegistry.listAvailableConnectors('TRANSLATION');
