import { ImageAnnotation } from '@annotorious/react';
import { EntityType, RelationshipType } from '@/model';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import { DataModel } from '@/store';

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

interface ServiceConfigMap {

  ANNOTATION: AnnotationServiceConfig;

  TRANSCRIPTION: TranscriptionServiceConfig;

  TRANSLATION: TranslationServiceConfig;

}

export type ServiceType = keyof ServiceConfigMap;

interface BaseServiceConfig {

  description?: string;

  parameters?: ServiceConfigParameter[];

  requiresRegion?: boolean;
}

export interface AnnotationServiceConfig extends BaseServiceConfig {

  type: 'ANNOTATION';

}

export interface TranscriptionServiceConfig extends BaseServiceConfig {

  type: 'TRANSCRIPTION';

  supportsEntityExtraction?: boolean;

}

export interface TranslationServiceConfig extends BaseServiceConfig {

  type: 'TRANSLATION';

  displayName: string;

  arguments?: Record<string, any>;

}

export type ServiceConfig = ServiceConfigMap[ServiceType];

export type ServiceConfigOf<T extends ServiceType> = ServiceConfigMap[T];

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

  annotate(image: File | string, transform: PageTransform, options?: Record<string, any>, tags?: EntityType[], relations?: RelationshipType[]): Promise<AnnotationServiceResponse>;

  parseAnnotationResponse: AnnotationServiceCrosswalk;

}

export interface TranscriptionServiceConnector {

  transcribe(image: File | string, transform: PageTransform, options?: Record<string, any>, tags?: EntityType[]): Promise<AnnotationServiceResponse>;

  parseTranscriptionResponse: AnnotationServiceCrosswalk;

}

export interface TranslationServiceConnector {

  translate(text: string, targetLanguage?: string, options?: Record<string, any>): Promise<TranslationServiceResponse>;

}

export type ServiceConnector = AnnotationServiceConnector | TranscriptionServiceConnector | TranslationServiceConnector;

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

export type PageTransform = {

  (region: Region): Region;

  (point: Point): Point;

  readonly source: { width: number, height: number };

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

  isFlipped?: boolean;
  
}

export type Rotation = number;

export interface TranslationServiceResponse {
  
  generator: Generator;

  translation: string;

  language?: string;

}

export interface AnnotationBatch {

  annotations: ImageAnnotation[];

  relations?: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][];

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

export type AnnotationServiceCrosswalk<T = any> = (
  data: T, 
  transform: PageTransform,
  region?: Region, 
  options?: Record<string, any>,
  model?: DataModel
) => AnnotationServiceCrosswalkResponse;

export interface AnnotationServiceCrosswalkResponse {

  annotations: ImageAnnotation[];

  relations?: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][];

}