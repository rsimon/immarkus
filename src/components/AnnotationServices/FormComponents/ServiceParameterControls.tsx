import { ServiceConfigParameter, ServiceConnectorConfig } from '@/services';
import { CredentialParameterControl, RadioParameterControl, StringParameterControl, SwitchParameterControl } from './ParameterControls';

interface ServiceParameterControlsProps {

  connector: ServiceConnectorConfig;

  parameters: ServiceConfigParameter[];

  values?: Record<string, any>;

  onChange(key: string, value: any): void;

}

export const ServiceParameterControls = (props: ServiceParameterControlsProps) => {
  const { connector, values } = props;

  return props.parameters.map(param => {
    const value = values?.[param.id];

    const onValueChanged = (v: any) => props.onChange(param.id, v);

    return param.type === 'credential' ? (
      <CredentialParameterControl 
        key={param.id} 
        param={param} 
        connector={connector} 
        value={value} onValueChanged={onValueChanged} />
    ) : param.type === 'radio' ? (
      <RadioParameterControl 
        key={param.id} 
        param={param} 
        connectorId={connector.id} 
        value={value} 
        onValueChanged={onValueChanged} />
    ) : param.type === 'string' ? (
      <StringParameterControl 
        key={param.id} 
        param={param} 
        connector={connector} 
        value={value} 
        onValueChanged={onValueChanged} />
    ) : param.type === 'switch' ? (
      <SwitchParameterControl 
        key={param.id} 
        param={param}
        connectorId={connector.id} 
        checked={value} 
        onCheckedChange={onValueChanged} />
    ) : null
  });

}