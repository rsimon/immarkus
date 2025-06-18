import { ImageAnnotation } from "@annotorious/react";

export interface ServiceConfig {

  /** Any alphanumeric string, as long as unique within IMMARKUS **/
  id: string;

  /** Path to connector implementation relative to `src/services` **/
  connector: string;

  /** Service display name **/
  displayName: string;

  /** Service display description **/
  description: string;

  /** Configuration parameters supported by this service **/
  parameters?: Record<string, ServiceConfigParameter>;

}

export interface ServiceConfigStringParameter {

  type: 'string',
  
  options?: Record<string, string>;

}

// For future use
export type ServiceConfigParameter = ServiceConfigStringParameter;

export interface ServiceConnector {

  submit(image: File | string, options?: Record<string, any>): any;

  parseResponse(data: any, options?: Record<string, any>): ImageAnnotation[];

}
