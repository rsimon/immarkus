import { ServiceConnectorConfig, TranslationServiceConfig } from '@/services';

export interface TranslationSettings { 

  connector: ServiceConnectorConfig;
  
  service: TranslationServiceConfig;

  index: number;

  language?: string;

}