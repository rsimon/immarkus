import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslationSettings } from '@/components/Translation';
import { ServiceParameterControls } from '@/components/AnnotationServices/FormComponents';
import { ServiceConfigParameter, ServiceConnectorConfig } from '@/services';
import { TestButton } from './TestButton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';
import { 
  getAvailableTranslationConnectors, 
  getPersistedTranslationService,
  persistTranslationService, 
} from '@/components/Translation';

const connectors = getAvailableTranslationConnectors();

const toServiceKey = (connector: ServiceConnectorConfig, index: number) =>
  `${connector.id}::${index}`;

export const Translation = () => {
  const { t } = useTranslation('settings');

  const [selectedService, setSelectedService] = useState<TranslationSettings | undefined>(
    () => getPersistedTranslationService(connectors));

  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});

  const onSelectService = (key: string) => {
    const [connectorId, indexString] = key.split('::');

    const index = Number(indexString);

    const connector = connectors.find(item => item.id === connectorId);
    const service = connector?.services.filter(item => item.type === 'TRANSLATION')[index];

    if (!connector || !service || !Number.isInteger(index) || index < 0) return;

    const nextService = { connector, service, index };

    persistTranslationService(nextService);
    setSelectedService(nextService);

    // Just to ensure we're not storing the credentials on the wrong service
    setCredentialValues({});
  }

  const parameters = selectedService?.connector.parameters?.filter(
    (param): param is Extract<ServiceConfigParameter, { type: 'credential' }> => param.type === 'credential'
  ) || [];

  const onCredentialChange = (key: string, value: string) => {
    setCredentialValues(current => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y- max-w-2xl">
      <section className="p-6">
        <div className="space-y-10">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{t('translation.title')}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {t('translation.description')}
            </p>
          </div>

          <form 
            className="space-y-12" 
            onSubmit={e => e.preventDefault()}>
            <fieldset className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{t('translation.service.label')}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t('translation.service.description')}
                </p>
              </div>

              <Select
                value={selectedService 
                  ? toServiceKey(selectedService.connector, selectedService.index) 
                  : ''}
                onValueChange={onSelectService}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {connectors.flatMap(connector => (
                    connector.services.filter(s => s.type === 'TRANSLATION')).map((service, idx) => (
                      <SelectItem 
                        key={`${connector.id}:${idx}`}
                        value={toServiceKey(connector, idx)}>
                        {service.displayName}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </fieldset>

            <fieldset>
              {selectedService && parameters.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{t('translation.credentials.label')}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {t('translation.credentials.description')}
                    </p>
                  </div>

                  <ServiceParameterControls
                    connector={selectedService.connector}
                    parameters={parameters}
                    values={credentialValues}
                    onChange={onCredentialChange} />

                  <TestButton settings={selectedService} />
                </div>
              )}
            </fieldset>
          </form>
        </div>
      </section>
    </div>
  )

}
