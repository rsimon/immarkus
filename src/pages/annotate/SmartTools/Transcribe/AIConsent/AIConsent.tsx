import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { Checkbox } from '@/ui/Checkbox';
import { Label } from '@/ui/Label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle
} from '@/ui/AlertDialog';

interface AIConsentProps {

  optIn: boolean;

  onChangeOptIn(optIn: boolean): void;

}

export const AIConsent = (props: AIConsentProps) => {

  const { t } = useTranslation('smartTools');

  const [open, setOpen] = useState(!props.optIn);
  
  const [checked, _setChecked] = useState(props.optIn);

  const setChecked = (checked: boolean) => {
    _setChecked(checked);
    props.onChangeOptIn(checked);
  }

  return (
    <AlertDialog 
      open={open}
      onOpenChange={setOpen}>
      
      <AlertDialogContent
        className="max-w-2xl">
        <AlertDialogTitle className="flex gap-2 items-center text-destructive">
          <TriangleAlert className="size-5" /> {t('transcribe.consent.title')}
        </AlertDialogTitle>

        <AlertDialogDescription className="leading-relaxed space-y-4">
          <p>
            {t('transcribe.consent.intro')}
          </p>

          <ol className="space-y-4 list-decimal pl-5">
            <li className="pl-1">
              <Trans
                ns="smartTools"
                i18nKey="transcribe.consent.externalProcessing"
                components={{ strong: <strong /> }} />
            </li>

            <li className="pl-1">
              <Trans
                ns="smartTools"
                i18nKey="transcribe.consent.ownKeys"
                components={{ strong: <strong /> }} />
            </li>

            <li className="pl-1">
              <Trans
                ns="smartTools"
                i18nKey="transcribe.consent.imageRights"
                components={{ strong: <strong /> }} />
            </li>

            <li className="pl-1">
              <Trans
                ns="smartTools"
                i18nKey="transcribe.consent.noHiddenTransfers"
                components={{ strong: <strong /> }} />
            </li>
          </ol>

          <p>
            {t('transcribe.consent.confirmation')}
          </p>

          <div className="p-4 flex gap-2 items-center font-medium border rounded-md mb-6">
            <Checkbox
              id="ai-opt-in"
              checked={checked}
              onCheckedChange={checked => setChecked(checked as boolean)} />
            <Label htmlFor="ai-opt-in">{t('transcribe.consent.agree')}</Label>
          </div>

          <AlertDialogAction className="w-full">
            {t('transcribe.consent.close')}
          </AlertDialogAction>
        </AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  )

}