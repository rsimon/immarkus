import { Spinner } from '@/components/Spinner';
import { ProcessingState } from '../../ProcessingState';
import { CloudAlert, CloudCheck } from 'lucide-react';

interface ProcessingStateBadgeProps {

  processingState: ProcessingState;

}

export const ProcessingStateBadge = (props: ProcessingStateBadgeProps) => {

  const state = props.processingState;

  const isSuccess = state === 'success';

  const isError = state === 'compressing_failed' || state === 'ocr_failed';

  return isError ? (
    <div className="w-full bg-destructive text-white rounded-md h-10 gap-2 flex items-center justify-center text-sm">
      <CloudAlert className="size-5 mb-[1px]" /> 
      {state === 'compressing_failed' ? (
        <span>Image compression failed</span>
      ) : state === 'ocr_failed' ? (
        <span>OCR Service Error</span>
      ) : null}
    </div>
  ) : isSuccess ? (
    <div className="w-full bg-green-400 h-10 text-green-900 rounded-md flex items-center justify-center gap-2 text-sm">
      <CloudCheck className="size-5 mb-[1px]" /> Success
    </div>
  ) : (
    <div className="w-full bg-black text-white h-10 rounded-md flex items-center justify-center px-4 gap-2.5 text-sm">
      <Spinner className="size-5 mb-[1px]" />

      {state === 'fetching_iiif' ? (
        <span>Fetching IIIF Image</span>
      ) : state === 'compressing' ? (
        <span>Compressing Image</span>
      ) : state === 'pending' ? (
        <span>Processing</span>
      ) : null}
    </div>
  )

}