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

  /** Set to true if the service requires a user-provided API key **/
  requiresKey?: boolean;

  /** Configuration parameters supported by this service **/
  parameters?: ServiceConfigParameter[];

}

export interface ServiceConfigApiKeyParameter {

  type: 'api_key';

  id: string;

  displayName: string;

  required?: boolean;

}

export interface ServiceConfigStringParameter {

  type: 'string';

  id: string;

  displayName: string;

  required?: boolean;
  
  options?: Record<string, string>;

}

export interface ServiceConfigSwitchParameter {

  type: 'switch';

  id: string;

  displayName: string;
  
  hint: string;

  required?: boolean;

}

export type ServiceConfigParameter = 
  | ServiceConfigApiKeyParameter
  | ServiceConfigStringParameter
  | ServiceConfigSwitchParameter;

export interface ServiceConnector {

  submit(image: File | string, options?: Record<string, any>): any;

  parseResponse: ServiceCrosswalk;

}

export type ServiceCrosswalk = (data: any, transform: PageTransform, options?: Record<string, any>) => ImageAnnotation[];

export type PageTransform = {

  (region: Point): Point;

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


