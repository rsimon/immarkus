import { CloudAlert, CloudCheck, Info } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { ProcessingState } from '../../Types';
import { Tooltip, TooltipContent } from '@/ui/Tooltip';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';

interface ProcessingStateBadgeProps {

  lastError?: string;

  processingState: ProcessingState;

}

export const ProcessingStateBadge = (props: ProcessingStateBadgeProps) => {

  const state = props.processingState;

  const isError = state === 'compressing_failed' || state === 'ocr_failed';

  return isError ? (
    <div className="w-full bg-destructive text-white rounded-md h-10 gap-2 flex items-center justify-center text-sm">
      <CloudAlert className="size-5 mb-[1px]" /> 
      {state === 'compressing_failed' ? (
        <span>Image compression failed</span>
      ) : state === 'ocr_failed' ? (
        <>
          <span>
            OCR Service Error
          </span>

          {props.lastError && (
            <Popover>
              <PopoverTrigger>
                <Info className="size-4 mt-[1px] opacity-70 hover:opacity-100" />
              </PopoverTrigger>

              <PopoverContent 
                side="top"
                sideOffset={6}
                className="text-xs px-2.5 py-2 w-48 leading-relaxed">
                {props.lastError}
              </PopoverContent>
            </Popover>
          )}
        </>
      ) : null}
    </div>
  ) : state === 'success_empty' ? (
    <div className="w-full bg-orange-400 h-10 text-white rounded-md flex items-center justify-center gap-2 text-sm">
      <CloudAlert className="size-5 mb-[1px]" /> No Results
    </div>
  ) : state === 'success' ? (
    <div className="w-full bg-green-600 h-10 text-white rounded-md flex items-center justify-center gap-2 text-sm">
      <CloudCheck className="size-5 mb-[1px]" /> Success
    </div>
  ) : (
    <div className="w-full bg-black text-white h-10 rounded-md flex items-center justify-center px-4 gap-2.5 text-sm">
      <Spinner className="size-5 mb-[1px]" />

      {state === 'cropping' ? ( 
        <span>Cropping Image</span>
      ) : state === 'fetching_iiif' ? (
        <span>Fetching IIIF Image</span>
      ) : state === 'compressing' ? (
        <span>Compressing Image</span>
      ) : state === 'pending' ? (
        <span>Processing</span>
      ) : null}
    </div>
  )

}