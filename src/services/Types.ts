import { ImageAnnotation } from '@annotorious/react';
import { EntityType } from '@/model';

export type ServiceType = 'TRANSCRIPTION' | 'TRANSLATION' | 'ANNOTATION';

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

export interface AnnotationServiceConfig {
  
  /** Type of service **/
  type: 'TRANSCRIPTION' | 'ANNOTATION';

  /** Service display description **/
  description: string;

  /** Set to true if the service requires a user-provded region bounding box **/
  requiresRegion?: boolean;

  /** Set to true if the service supports data model form filling **/
  supportsEntityExtraction?: boolean;

  /** Configuration parameters supported by this service **/
  parameters?: ServiceConfigParameter[];

}

export interface TranslationServiceConfig {

  type: 'TRANSLATION';

  displayName?: string;

  /** Service display description **/
  description?: string;

  arguments?: Record<string, any>;
  
}

export type ServiceConfig = 
  | AnnotationServiceConfig 
  | TranslationServiceConfig;

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

export interface AnnotationServiceConnector {

  annotate(image: File | string, options?: Record<string, any>, tags?: EntityType[]): Promise<AnnotationServiceResponse>;

  parseServiceResponse: AnnotationServiceCrosswalk;

}

export interface TranslationServiceConnector {

  translate(text: string, targetLanguage?: string, options?: Record<string, any>): Promise<TranslationServiceResponse>;

}


export type ServiceConnector = AnnotationServiceConnector | TranslationServiceConnector;

export interface AnnotationServiceResponse<T extends unknown = any> {

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

export type AnnotationServiceCrosswalk<T = any> = (data: T, transform: PageTransform, region?: Region, options?: Record<string, any>) => ImageAnnotation[];

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

  rotation?: number;
  
}

export type Rotation = 0 | 90 | 180 | 270;

export interface TranslationServiceResponse {
  
  generator: Generator;

  translation: string;

  language?: string;

}

export interface AnnotationBatch {

  annotations: ImageAnnotation[];

  generator: Generator;
  
}

export interface AnnotationServiceOptions {

  connectorId: string;

  serviceOptions?: Record<string, any>;

}

export type ProcessingState = 'cropping'
  | 'compressing' 
  | 'fetching_iiif' 
  | 'pending' 
  | 'success' 
  | 'success_empty'
  | 'compressing_failed' 
  | 'service_failed';

export interface AnnotationServiceResult<T = any> {

  data: T;

  generator: Generator;

  transform: PageTransform;

  region?: Region;

  crosswalk: AnnotationServiceCrosswalk;

} 


