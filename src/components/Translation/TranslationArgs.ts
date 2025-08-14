import { ServiceConnectorConfig, TranslationServiceConfig } from '@/services';

export interface TranslationArgs {

  connector: ServiceConnectorConfig;

  service: TranslationServiceConfig;

  text: string;

}