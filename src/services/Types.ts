import { ImageAnnotation } from '@annotorious/react';

export type ServiceType = 'TRANSCRIPTION' | 'TRANSLATION';

export interface ServiceConnectorConfig {

  /** Any alphanumeric string, as long as unique within IMMARKUS **/
  id: string;

  /** Path to connector implementation relative to `src/services` **/
  connector: string;

  /** Service display name **/
  displayName: string;

  /** Help text to show with the API key field, if any **/
  keyInstructions?: string;

  /** Set to true if the service requires a user-provided API key **/
  requiresKey?: boolean;

  /** Common configuration parameters for all services provided by this connector **/
  parameters?: ServiceConfigParameter[];

  /** List of services provided through this connector */
  services: ServiceConfig[];

}

export interface TranscriptionServiceConfig {
  
  /** Type of service **/
  type: 'TRANSCRIPTION';

  /** Service display description **/
  description: string;

  /** Set to true if the service requires a user-provded region bounding box **/
  requiresRegion?: boolean;

  /** Configuration parameters supported by this service **/
  parameters?: ServiceConfigParameter[];

}

export interface TranslationServiceConfig {

  type: 'TRANSLATION';

  displayName?: string;

  arguments?: Record<string, any>;
  
}

export type ServiceConfig = TranscriptionServiceConfig | TranslationServiceConfig;


export interface ServiceConfigCredentialParameter {

  type: 'credential';

  id: string;

  displayName: string;

  required?: boolean;

}

export interface ServiceConfigRadioParameter {

  type: 'radio';

  id: string;

  displayName: string;

  required?: boolean;

  options: [string, string][];

}

export interface ServiceConfigStringParameter {

  type: 'string';

  id: string;

  displayName: string;

  multiLine?: boolean;

  required?: boolean;

  persist?: boolean;

  default?: string;
  
  options?: [string, string][];

}

export interface ServiceConfigSwitchParameter {

  type: 'switch';

  id: string;

  displayName: string;
  
  hint: string;

  required?: boolean;

}

export type ServiceConfigParameter = 
  | ServiceConfigCredentialParameter
  | ServiceConfigRadioParameter
  | ServiceConfigStringParameter
  | ServiceConfigSwitchParameter;

export interface TranscriptionServiceConnector {

  transcribe(image: File | string, options?: Record<string, any>): Promise<TranscriptionServiceResponse>;

  parseTranscriptionResponse: TranscriptionServiceCrosswalk;

}

export interface TranslationServiceConnector {

  translate(text: string, options?: Record<string, any>): Promise<TranslationServiceResponse>;

}

export type ServiceConnector = TranscriptionServiceConnector | TranslationServiceConnector;

export interface TranscriptionServiceResponse<T extends unknown = any> {

  data: T; 

  generator: Generator;

}

export interface Generator {

  id: string;

  /** Defaults to 'Software' **/
  type?: string;

  name: string;

  homepage?: string; 

}

export type TranscriptionServiceCrosswalk = (data: any, transform: PageTransform, region?: Region, options?: Record<string, any>) => ImageAnnotation[];

export type PageTransform = {

  (point: Point): Point;

  (region: Region): Region;

}

export interface Point { 

  x: number;

  y: number;

}

export interface Region {

  x: number;

  y: number;

  w: number;

  h: number;
  
}

export interface TranslationServiceResponse {
  
  generator: Generator;

  translation: string;

  language?: string;

}

