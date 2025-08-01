import { ImageAnnotation } from '@annotorious/react';

export interface ServiceConfig {

  /** Any alphanumeric string, as long as unique within IMMARKUS **/
  id: string;

  /** Path to connector implementation relative to `src/services` **/
  connector: string;

  /** Service display name **/
  displayName: string;

  /** Service display description **/
  description: string;

  /** Help text to show with the API key field, if any **/
  keyInstructions?: string;

  /** Set to true if the service requires a user-provided API key **/
  requiresKey?: boolean;

  /** Set to true if the service requires a user-provded region bounding box **/
  requiresRegion?: boolean;

  /** Configuration parameters supported by this service **/
  parameters?: ServiceConfigParameter[];

}

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

export interface ServiceConnector {

  submit(image: File | string, options?: Record<string, any>): Promise<ServiceConnectorResponse>;

  parseResponse: ServiceCrosswalk;

}

export interface ServiceConnectorResponse<T extends unknown = any> {

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

export type ServiceCrosswalk = (data: any, transform: PageTransform, region?: Region, options?: Record<string, any>) => ImageAnnotation[];

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


