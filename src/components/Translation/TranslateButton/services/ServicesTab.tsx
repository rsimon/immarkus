import { Check } from 'lucide-react';
import { Label } from '@/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/ui/RadioGroup';
import { ServiceConnectorConfig } from '@/services';
import { TranslationSettings } from '../Types';

interface ServicesTabProps {

  availableConnectors: ServiceConnectorConfig[];

  selected: TranslationSettings;

  onChangeSelected(service: TranslationSettings): void;

}

export const ServicesTab = (props: ServicesTabProps) => {

  const { availableConnectors, selected } = props;

  const onChangeService = (value: string) => {    
    try {
      const [connectorId, indexStr] = value.split('::');
      const index = parseInt(indexStr);

      const connector = availableConnectors.find(c => c.id === connectorId);
      const service = connector.services.filter(s => s.type === 'TRANSLATION')[index];
      props.onChangeSelected({ connector, service, index });
    } catch {
      // Should never happen
      console.error('Error parsing service ID', value);
    }
  }

  const isSelected = (connector: ServiceConnectorConfig, index: number) =>
    `${selected.connector.id}::${selected.index}` === `${connector.id}::${index}`;

  return (
    <RadioGroup
      className="gap-0 p-1"
      value={`${selected.connector.id}::${selected.index}`}
      onValueChange={onChangeService}>
      {availableConnectors.map(connector => (
        connector.services.filter(s => s.type === 'TRANSLATION')).map((service, idx) => (
        <div 
          key={`${connector.id}-${idx}`} 
          className="flex items-center hover:bg-muted px-2 rounded-sm">
          {isSelected(connector, idx) ? (
            <Check className="size-4" />
          ) : (
            <div className="w-4 h-auto" />
          )}

          <Label
            htmlFor={`${connector.id}::${idx}`}
            className="rounded-md cursor-pointer transition-colors p-2 w-full font-normal text-xs">
            <RadioGroupItem
              value={`${connector.id}::${idx}`}
              id={`${connector.id}::${idx}`}
              className="sr-only" />
            {service.displayName || connector.displayName}
          </Label>
        </div>
      )))}
    </RadioGroup>
  )
}