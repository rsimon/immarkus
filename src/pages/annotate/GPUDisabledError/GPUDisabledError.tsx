import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from '@/ui/AlertDialog';
import { ShieldAlert } from 'lucide-react';

export const GPUDisabledError = () => {

  const { t } = useTranslation('annotate');

  const navigate = useNavigate();

  return (
    <AlertDialog open={true}>      
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex gap-1.5 items-center text-destructive">
            <ShieldAlert className="size-5.5" /> {t('gpuError.title')}
          </AlertDialogTitle>

          <AlertDialogDescription className="py-2 leading-relaxed space-y-4">
            <p>
              <Trans ns="annotate" i18nKey="gpuError.intro" components={{ strong: <strong /> }} />
            </p>

            <div>
              <p>
                <Trans ns="annotate" i18nKey="gpuError.chromeIntro" components={{ strong: <strong /> }} />
              </p>
              <ul className="list-disc pl-4 pt-1">
                <li>{t('gpuError.stepOpenMenu')}</li>
                <li><Trans ns="annotate" i18nKey="gpuError.chromeStep2" components={{ strong: <strong /> }} /></li>
                <li><Trans ns="annotate" i18nKey="gpuError.chromeStep3" components={{ strong: <strong /> }} /></li>
                <li><Trans ns="annotate" i18nKey="gpuError.chromeStep4" components={{ strong: <strong /> }} /></li>
              </ul>
            </div>

            <div>
              <p>
                <Trans ns="annotate" i18nKey="gpuError.edgeIntro" components={{ strong: <strong /> }} />
              </p>
              <ul className="list-disc pl-4 pt-1">
                <li>{t('gpuError.stepOpenMenu')}</li>
                <li><Trans ns="annotate" i18nKey="gpuError.edgeStep2" components={{ strong: <strong /> }} /></li>
                <li><Trans ns="annotate" i18nKey="gpuError.edgeStep3" components={{ strong: <strong /> }} /></li>
                <li><Trans ns="annotate" i18nKey="gpuError.edgeStep4" components={{ strong: <strong /> }} /></li>
                <li>{t('gpuError.edgeStep5')}</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => navigate(-1)}>
            {t('gpuError.goBack')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

}