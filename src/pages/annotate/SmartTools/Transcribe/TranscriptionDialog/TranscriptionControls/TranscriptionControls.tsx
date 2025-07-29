import { useEffect, useMemo, useState } from 'react';
import { CircleCheck, KeyRound, ScanText, SquareDashedMousePointer } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
import { cn } from '@/ui/utils';
import { ServiceRegistry, ServiceConfigParameter, useService, Region } from '@/services';
import { OCROptions, ProcessingState } from '../../Types';
import { ProcessingStateBadge } from './ProcessingStateBadge';
import { 
  CredentialParameterControl,
  RadioParameterControl,
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

  region?: Region;

  options: OCROptions;

  onServiceChanged(serviceId: string): void;

  onServiceOptionChanged(key: string, value: any): void;

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
    const allRequiredFilled = required.length === 0 || required.every(param => Boolean((serviceOptions || {})[param.id]));

    return serviceConfig.requiresRegion ? allRequiredFilled && props.region : allRequiredFilled;
  }, [serviceConfig, props.options, props.region]);

  useEffect(() => {
    // Show processing state instead of submit button
    setShowProcessingState(Boolean(props.processingState));
  }, [props.processingState]);

  const renderParameterControl = (param: ServiceConfigParameter) => {
    const value = (serviceOptions || {})[param.id];

    const onValueChanged = (value: any) =>
      props.onServiceOptionChanged(param.id, value);

    return param.type === 'credential' ? (
      <CredentialParameterControl
        key={param.id}
        param={param} 
        service={serviceConfig} 
        value={value} 
        onValueChanged={onValueChanged} />
    ) : param.type === 'radio' ? (
      <RadioParameterControl 
        key={param.id}
        param={param}
        value={value}
        onValueChanged={onValueChanged} />
    ) : param.type === 'string' ? (
      <StringParameterControl 
        key={param.id}
        param={param} 
        service={serviceConfig} 
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
            onValueChange={props.onServiceChanged}>
            <SelectTrigger 
              className="w-full text-left h-auto text-sm border rounded shadow-xs mt-1.5 pl-2.5 pr-2 py-2.5 flex justify-between">
              <div>
                <h4 className="font-semibold flex gap-2.5 items-center">
                  {serviceConfig.displayName}
                  {serviceConfig.requiresKey && (
                    <span className="rounded-full mb-[1px] text-[11px] font-medium flex gap-1.5 items-center border text-amber-500 border-amber-400 bg-orange-50 pl-2 pr-2.5 py-0.5">
                      <KeyRound className="size-3" /> API Key Required
                    </span>
                  )}
                </h4>
                <p className="text-xs leading-relaxed mt-0.5">
                  {serviceConfig.description}
                </p>
              </div>
            </SelectTrigger>

            <SelectContent
              align="start"
              className="[&_div[role=option]_span:nth-child(2)]:flex-1">
              {services.map(s => (
                <SelectItem
                  key={s.id}
                  value={s.id}
                  className="flex items-start [&>*:first-child]:mt-0.5 py-3">
                  <h4 className="font-semibold flex gap-2 items-center justify-between">
                    {s.displayName} {s.requiresKey && (
                      <KeyRound className="size-3.5 text-orange-400 mr-1" />
                    )} 
                  </h4>
                  <p className="text-xs leading-relaxed mt-0.5">
                    {s.description}
                  </p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>

        <form 
          onSubmit={evt => evt.preventDefault()}
          className="space-y-4">
          {(serviceConfig.parameters || []).map(param => renderParameterControl(param))}
        </form>
      </div>

      <div className="space-y-2 pt-8">
        {serviceConfig.requiresRegion && (
          <div className={cn(
            'border rounded-md px-2.5 py-2 text-sm leading-relaxed',
            props.region 
              ? 'border-green-700/15 text-green-700 bg-green-700/10'
              : 'border-amber-700/15 text-amber-700 bg-amber-700/10'
            )}>
            <h5 className="font-semibold flex gap-2 items-center mb-1">
              {props.region ? (
                <>
                  <CircleCheck className="size-4.5 mb-0.5" />
                  Area Selected
                </>
              ) : (
                <>
                  <SquareDashedMousePointer className="size-4.5 mb-0.5" /> 
                  Select Area to Transcribe
                </>
              )} 
            </h5>

            <p>
              This service returns transcriptions without bounding box information. Select the area you 
              want to transcribe. The result will be inserted as a single annotation.
            </p>
          </div>
        )}

        {showProcessingState ? (
          <ProcessingStateBadge
            lastError={props.lastError}
            processingState={props.processingState} />
        ) : (
          <Button 
            className="w-full flex gap-2 1.5"
            onClick={() => props.onSubmit()}
            disabled={!canSumbit}>
            <ScanText className="size-4.5" /> Run Transcription
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