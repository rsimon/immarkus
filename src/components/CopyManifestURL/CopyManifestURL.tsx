import { type MouseEvent, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { IIIFManifestResource } from '@/model';
import { IIIFIcon } from '../IIIFIcon';

interface CopyManifestURLProps {

  manifest: IIIFManifestResource;

}

export const CopyManifestURL = (props: CopyManifestURLProps) => {

  const [copied, setCopied] = useState(false);

  const onCopyManifestURL = (evt: MouseEvent) => {
    evt.preventDefault();

    navigator.clipboard.writeText(props.manifest.uri).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 750);
    });
  }

  return (        
    <button 
      onClick={onCopyManifestURL}
      className="w-full flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
      {copied ? (
        <ClipboardCheck className="size-4 text-green-700" /> 
      ) : (
        <IIIFIcon color className="size-4" />
      )} <span className="mt-px">Copy Manifest URL</span>
    </button>
  )

}