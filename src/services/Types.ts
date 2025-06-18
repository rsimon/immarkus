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
  parameters?: ServiceConfigParameter[];

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
   | ServiceConfigStringParameter
   | ServiceConfigSwitchParameter;

export interface ServiceConnector {

  submit(image: File | string, options?: Record<string, any>): any;

  parseResponse(data: any, options?: Record<string, any>): ImageAnnotation[];

}
