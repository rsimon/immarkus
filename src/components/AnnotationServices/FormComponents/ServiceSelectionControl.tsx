import { useTranslation } from 'react-i18next';
import { KeyRound } from 'lucide-react';
import { AnnotationServiceConfig, ServiceConfig, ServiceConnectorConfig } from '@/services';
import { Label } from '@/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/ui/Select';

interface ServiceSelectionControlProps {

  available: ServiceConnectorConfig[];

  connectorConfig: ServiceConnectorConfig;

  serviceConfig: ServiceConfig;

  onConnectorChanged(id: string): void;

}

export const ServiceSelectionControl = (props: ServiceSelectionControlProps) => {
  const { available, connectorConfig, serviceConfig } = props;

  const { t } = useTranslation('smartTools');
  const { t: ts } = useTranslation('services');

  return (
    <fieldset className="space-y-2">
      <Label className="font-semibold">{t('annotate.controls.service')}</Label>

      <Select
        value={connectorConfig.id}
        onValueChange={props.onConnectorChanged}>
        <SelectTrigger 
          className="w-full text-left h-auto text-sm border rounded shadow-xs mt-1.5 pl-2.5 pr-2 py-2.5 flex justify-between">
          <div>
            <h4 className="font-semibold flex gap-2.5 items-center">
              {connectorConfig.displayName}
              {connectorConfig.requiresKey && (
                <span className="rounded-full mb-px text-[11px] font-medium flex gap-1.5 items-center border text-amber-500 border-amber-400 bg-orange-50 pl-2 pr-2.5 py-0.5">
                  <KeyRound className="size-3" /> {t('annotate.controls.apiKeyRequired')}
                </span>
              )}
            </h4>
            <p className="text-xs leading-relaxed mt-0.5">
              {ts(`${connectorConfig.id}.description`, { defaultValue: serviceConfig.description })}
            </p>
          </div>
        </SelectTrigger>

        <SelectContent
          align="start"
          className="[&_div[role=option]_span:nth-child(2)]:flex-1">
          {available.map(c => (
            <SelectItem
              key={c.id}
              value={c.id}
              className="flex items-start [&>*:first-child]:mt-0.5 py-3">
              <h4 className="font-semibold flex gap-2 items-center justify-between">
                {c.displayName} {c.requiresKey && (
                  <KeyRound className="size-3.5 text-orange-400 mr-1" />
                )} 
              </h4>
              <p className="text-xs leading-relaxed mt-0.5">
                {ts(`${c.id}.description`, { defaultValue: c.services.find(s => s.type === 'TRANSCRIPTION')?.description })}
              </p>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </fieldset>
  )

}