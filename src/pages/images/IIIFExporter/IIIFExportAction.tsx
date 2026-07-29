import { useTranslation } from 'react-i18next';
import { IIIFIcon } from '@/components/IIIFIcon';
import { DropdownMenuItem } from '@/ui/DropdownMenu';

interface IIIFExportActionProps {

  disabled?: boolean;

  onSelect(): void;

}

export const IIIFExportAction = (props: IIIFExportActionProps) => {

  const { t } = useTranslation('images');

  return (
    <DropdownMenuItem 
      disabled={props.disabled}
      onSelect={props.onSelect}>
      <IIIFIcon 
        light
        className="size-4 text-muted-foreground mr-2" /> {t('common.exportIIIF')}
    </DropdownMenuItem>
  )

}