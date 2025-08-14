import { ServiceConnectorConfig, TranslationServiceConfig } from '@/services';

export interface TranslationSettings { 
  
  service: TranslationServiceSettings;

  language?: string;

}

export interface TranslationServiceSettings {

  connector: ServiceConnectorConfig;
  
  service: TranslationServiceConfig;

  index: number;

}
