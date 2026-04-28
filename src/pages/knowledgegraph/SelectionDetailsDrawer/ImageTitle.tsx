import { useState } from 'react';
import { Clipboard, ClipboardCheck, Image } from 'lucide-react';
import { LoadedImage } from '@/model';
import { cn } from '@/ui/utils';
import { useManifest } from './useManifest';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent } from '@/ui/Tooltip';
import { TooltipTrigger } from '@radix-ui/react-tooltip';

interface ImageTitleProps {

  image: LoadedImage;

}

export const ImageTitle = (props: ImageTitleProps) => {

  const manifest = useManifest(props.image);

  return (
    <h3 className="py-1 space-y-0.5 flex flex-col justify-center items-start">
      <div className={cn(
        'flex gap-1.5 pr-1 text-xs whitespace-nowrap overflow-hidden',
        manifest ? 'items-start' : 'items-center'
        )}>
        <Image className="h-3.5 w-3.5" />
        <span className="overflow-hidden text-ellipsis">{props.image?.name}</span>
      </div>
      {manifest && (
        <div className="text-xs font-normal flex gap-1 items-center">
          {manifest.name} 
          <CopyManifestURLButton url={manifest.uri} />
        </div>
      )}
    </h3>
  )

}

interface CopyManifestURLButtonProps {

  url: string;

}


export const CopyManifestURLButton = (props: CopyManifestURLButtonProps) => {

  const [copied, setCopied] = useState(false);
  
  const onCopyManifestURL = (evt: React.MouseEvent) => {
    evt.preventDefault();

    navigator.clipboard.writeText(props.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 750);
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-1 mb-px"
          onClick={onCopyManifestURL}>
          {copied ? (
            <ClipboardCheck className="size-3 text-green-700" /> 
          ) : (      
            <Clipboard className="size-3" />
          )}
        </Button>
      </TooltipTrigger>
      
      <TooltipContent>
        Copy manifest URL to clipboard
      </TooltipContent>
    </Tooltip>
  )

}