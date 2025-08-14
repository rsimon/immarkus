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
      className="gap-0"
      value={`${selected.connector.id}::${selected.index}`}
      onValueChange={onChangeService}>
      {availableConnectors.map(connector => (
        connector.services.filter(s => s.type === 'TRANSLATION')).map((service, idx) => (
        <div 
          key={`${connector.id}-${idx}`} 
          className="flex gap-2 p-2 items-center hover:bg-accent rounded-sm font-sm">
          {isSelected(connector, idx) ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <div className="size-4" />
          )}

          <Label
            htmlFor={`${connector.id}::${idx}`}
            className="rounded-md cursor-pointer transition-colors font-normal">
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