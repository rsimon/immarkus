import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
import { ServiceRegistry, ServiceConfigParameter } from '@/services';
import { OCROptions, ProcessingState } from '../../Types';
import { ProcessingStateBadge } from './ProcessingStateBadge';
import { StringParameterControl, SwitchParameterControl } from './parameters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/ui/Select';

interface TranscriptionControlsProps {

  processingState?: ProcessingState;

  options: Partial<OCROptions>;

  onOptionsChanged(options: Partial<OCROptions>): void;

  onCancel(): void;

  onSubmit(): void;

}

const services = ServiceRegistry.listAvailableServices();

export const TranscriptionControls = (props: TranscriptionControlsProps) => {

  const [service, setService] = useState(services[0]);

  const [settings, setSettings] = useState<Record<string, any>>({});

  const [showProcessingState, setShowProcessingState] = useState(false);

  useEffect(() => {
    // Reset settings when service changes
    setSettings({});
  }, [service]);

  useEffect(() => {
    // Re-enable submit button if user changes settings
    setShowProcessingState(false);
  }, [settings]);

  const canSumbit = useMemo(() => {
    // Check if all required params are filled
    const required = (service.parameters || []).filter(p => p.required);
    return required.length === 0 || required
      .every(param => Object.keys(settings).includes(param.id));
  }, [service, settings]);

  useEffect(() => {
    // Show processing state instead of submit button
    setShowProcessingState(Boolean(props.processingState));
  }, [props.processingState]);

  const renderParameterControl = (param: ServiceConfigParameter) => {
    const value = settings[param.id];

    const onValueChanged = (value: any) => 
      setSettings(current => ({...current, [param.id]: value }));

    return param.type === 'string' ? (
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
            value={service.id}
            onValueChange={id => setService(services.find(s => s.id === id))}>
            <SelectTrigger 
              className="w-full text-left h-auto text-sm border rounded shadow-xs mt-2 pl-2.5 pr-2 py-2 flex justify-between">
              <div>
                <h4 className="font-semibold">
                  {service.displayName}
                </h4>
                <p className="text-xs leading-relaxed mt-0.5">
                  {service.description}
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

        {(service.parameters || []).map(param => renderParameterControl(param))}
      </div>

      <div className="space-y-2">
        {showProcessingState ? (
          <ProcessingStateBadge
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