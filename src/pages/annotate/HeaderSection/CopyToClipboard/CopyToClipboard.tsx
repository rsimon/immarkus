import { Clipboard, ClipboardCheck, ClipboardX } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { LoadedImage } from '@/model';
import { ToolbarButton } from '../../ToolbarButton';
import { useCopyToClipboard } from './useCopyToClipboard';

interface CopyToClipboardProps {

  images: LoadedImage[];

}

export const CopyToClipboard = (props: CopyToClipboardProps) => {

  const { status, canCopy, copyToClipboard } = useCopyToClipboard(props.images);

  return (
    <ToolbarButton
      disabled={!canCopy}
      tooltip="Copy image snippet to clipboard"
      onClick={copyToClipboard}>
      {status === 'idle' ? (
        <Clipboard className="size-8 p-2" />
      ) : status === 'busy' ? (
        <Spinner className="size-8 p-2.5" />
      ) : status === 'success' ? (
        <ClipboardCheck className="size-8 p-2" />
      ) : status === 'failed' ? (
        <ClipboardX className="size-8 p-2 text-red-600" />
      ) : null}
    </ToolbarButton>
  )

}