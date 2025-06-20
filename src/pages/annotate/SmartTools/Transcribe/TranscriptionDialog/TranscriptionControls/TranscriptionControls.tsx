import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
import { ServiceRegistry, ServiceConfigParameter, useService } from '@/services';
import { OCROptions, ProcessingState } from '../../Types';
import { ProcessingStateBadge } from './ProcessingStateBadge';
import { 
  APIKeyParameterControl,
  StringParameterControl, 
  SwitchParameterControl 
} from './parameters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/ui/Select';

interface TranscriptionControlsProps {

  lastError?: string;

  processingState?: ProcessingState;

  options: OCROptions;

  onOptionsChanged(options: OCROptions): void;

  onCancel(): void;

  onSubmit(): void;

}

const services = ServiceRegistry.listAvailableServices();

export const TranscriptionControls = (props: TranscriptionControlsProps) => {

  const { serviceId, serviceOptions } = props.options;

  const { config: serviceConfig } = useService(serviceId);

  const [showProcessingState, setShowProcessingState] = useState(false);

  useEffect(() => {
    // Re-enable submit button if user changes settings
    setShowProcessingState(false);
  }, [props.options]);

  const canSumbit = useMemo(() => {
    // Check if all required params are filled
    const required = (serviceConfig?.parameters || []).filter(p => p.required);
    return required.length === 0 || required.every(param => Object.keys(serviceOptions || {}).includes(param.id));
  }, [serviceConfig, props.options]);

  useEffect(() => {
    // Show processing state instead of submit button
    setShowProcessingState(Boolean(props.processingState));
  }, [props.processingState]);

  const onChangeService = (serviceId: string) =>
    props.onOptionsChanged({ serviceId });

  const renderParameterControl = (param: ServiceConfigParameter) => {
    const value = (serviceOptions || {})[param.id];

    const onValueChanged = (value: any) => 
      props.onOptionsChanged({
        serviceId, 
        serviceOptions: {
          ...(serviceOptions || {}),
          [param.id]: value 
        }
      });

    return param.type === 'api_key' ? (
      <APIKeyParameterControl
        key={param.id}
        param={param} 
        serviceId={serviceId} 
        value={value} 
        onValueChanged={onValueChanged} />
    ) : param.type === 'string' ? (
      <StringParameterControl 
        key={param.id}
        param={param} 
        value={value} 
        onValueChanged={onValueChanged} />
    ) : param.type === 'switch' ? (
      <SwitchParameterControl 
        key={param.id}
        param={param} 
        checked={value} 
        onCheckedChange={onValueChanged} />
    ) : null;
  }

  return (
    <div className="px-2 pt-1 flex flex-col h-full justify-between">
      <div className="space-y-8">
        <fieldset className="space-y-2">
          <Label className="font-semibold">Service</Label>

          <Select
            value={serviceConfig.id}
            onValueChange={onChangeService}>
            <SelectTrigger 
              className="w-full text-left h-auto text-sm border rounded shadow-xs mt-2 pl-2.5 pr-2 py-2 flex justify-between">
              <div>
                <h4 className="font-semibold">
                  {serviceConfig.displayName}
                </h4>
                <p className="text-xs leading-relaxed mt-0.5">
                  {serviceConfig.description}
                </p>
              </div>
            </SelectTrigger>

            <SelectContent
              align="start"
              className="">
              {services.map(s => (
                <SelectItem
                  key={s.id}
                  value={s.id}
                  className="flex items-start [&>*:first-child]:mt-0.5">
                  <h4 className="font-semibold">
                    {s.displayName}
                  </h4>
                  <p className="text-xs leading-relaxed mt-0.5">
                    {s.description}
                  </p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>

        <form onSubmit={evt => evt.preventDefault()}>
          {(serviceConfig.parameters || []).map(param => renderParameterControl(param))}
        </form>
      </div>

      <div className="space-y-2">
        {showProcessingState ? (
          <ProcessingStateBadge
            lastError={props.lastError}
            processingState={props.processingState} />
        ) : (
          <Button 
            className="w-full"
            onClick={() => props.onSubmit()}
            disabled={!canSumbit}>
            Start OCR Processing
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )

}