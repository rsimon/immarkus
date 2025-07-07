import { useState } from 'react';
import { Clipboard, ClipboardCheck, ClipboardPen, ClipboardX } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { LoadedImage } from '@/model';
import { ToolbarButton } from '../../ToolbarButton';
import { useCopyToClipboard } from './useCopyToClipboard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/ui/Select';

interface CopyToClipboardProps {

  images: LoadedImage[];

}

type CopyMode = 'masked' | 'unmasked';

export const CopyToClipboard = (props: CopyToClipboardProps) => {

  const [mode, setMode] = useState<CopyMode>('masked');

  const { status, canCopy, copyToClipboard } = useCopyToClipboard(props.images, mode === 'masked');

  return (
    <div className="flex items-center">
      <ToolbarButton
        disabled={!canCopy}
        tooltip="Copy image snippet to clipboard"
        onClick={copyToClipboard}>
        {status === 'busy' ? (
          <Spinner className="size-6 p-2" />
        ) : status === 'idle' ? (
          mode === 'masked' ? (
            <ClipboardPen className="size-8 py-2 px-1 w-auto" />
          ) : (
            <Clipboard className="size-8 py-2 px-1 w-auto" />
          )
        ) : status === 'success' ? (
          <ClipboardCheck className="size-8 py-2 px-1 w-auto" />
        ) : status === 'failed' ? (
          <ClipboardX className="size-8 py-2 px-1 w-auto text-red-600" />
        ) : null}
      </ToolbarButton>

      <Select
        disabled={!canCopy}
        value={mode}
        onValueChange={m => setMode(m as CopyMode)}>
        <SelectTrigger className="bg-transparent border-0 shadow-none py-0 px-1" />

        <SelectContent
          alignOffset={-24}
          sideOffset={-3}>
          <SelectItem 
            value="masked"
            className="text-xs">
            Copy exact shape
          </SelectItem>

          <SelectItem 
            value="unmasked"
            className="text-xs">
            Copy bounding box
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

}