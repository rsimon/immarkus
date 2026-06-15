import { useTranslation } from 'react-i18next';
import { CloudAlert, CloudCheck, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Spinner } from '@/components/Spinner';
import { ProcessingState } from '../../Types';

interface ProcessingStateBadgeProps {

  lastError?: string;

  processingState: ProcessingState;

}

export const ProcessingStateBadge = (props: ProcessingStateBadgeProps) => {

  const { t } = useTranslation('smartTools');

  const state = props.processingState;

  const isError = state === 'compressing_failed' || state === 'ocr_failed';

  return isError ? (
    <div className="w-full bg-destructive text-white rounded-md h-10 gap-2 flex items-center justify-center text-sm">
      <CloudAlert className="size-5 mb-[1px]" /> 
      {state === 'compressing_failed' ? (
        <span>{t('transcribe.status.compressionFailed')}</span>
      ) : state === 'ocr_failed' ? (
        <>
          <span>
            {t('transcribe.status.ocrError')}
          </span>

          {props.lastError && (
            <Popover>
              <PopoverTrigger>
                <Info className="size-4 mt-[1px] opacity-70 hover:opacity-100" />
              </PopoverTrigger>

              <PopoverContent 
                side="top"
                sideOffset={6}
                className="text-xs px-2.5 py-2 w-72 leading-relaxed">
                <h3 className="font-semibold">{t('transcribe.status.ocrResponded')}</h3>
                <p className="italic mt-1">
                  "{props.lastError}"
                </p>
              </PopoverContent>
            </Popover>
          )}
        </>
      ) : null}
    </div>
  ) : state === 'success_empty' ? (
    <div className="w-full bg-orange-400 h-10 text-white rounded-md flex items-center justify-center gap-2 text-sm">
      <CloudAlert className="size-5 mb-[1px]" /> {t('transcribe.status.noResults')}
    </div>
  ) : state === 'success' ? (
    <div className="w-full bg-green-600 h-10 text-white rounded-md flex items-center justify-center gap-2 text-sm">
      <CloudCheck className="size-5 mb-[1px]" /> {t('transcribe.status.success')}
    </div>
  ) : (
    <div className="w-full bg-black text-white h-10 rounded-md flex items-center justify-center px-4 gap-2.5 text-sm">
      <Spinner className="size-5 mb-[1px]" />

      {state === 'cropping' ? (
        <span>{t('transcribe.status.cropping')}</span>
      ) : state === 'fetching_iiif' ? (
        <span>{t('transcribe.status.fetchingIIIF')}</span>
      ) : state === 'compressing' ? (
        <span>{t('transcribe.status.compressing')}</span>
      ) : state === 'pending' ? (
        <span>{t('transcribe.status.processing')}</span>
      ) : null}
    </div>
  )

}