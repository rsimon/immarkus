export interface BuildStep {

  step: string;

  selected?: string;

  options: BuildStepOption[];

}

export interface BuildStepOption {

  value: string;
  
  label: string;
  
  data?: any;

}