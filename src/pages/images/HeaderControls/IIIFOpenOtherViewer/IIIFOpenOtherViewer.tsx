import { MouseEvent, useState } from 'react';
import { ChevronDown, ClipboardCheck, Share2 } from 'lucide-react';
import { IIIFManifestResource } from '@/model';
import { Button } from '@/ui/Button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';
import { IIIFIcon } from '@/components/IIIFIcon';

interface IIIFOpenOtherViewerProps {

  manifest: IIIFManifestResource;

}

export const IIIFOpenOtherViewer = (props: IIIFOpenOtherViewerProps) => {

  const [copied, setCopied] = useState(false);

  const onCopyManifestURL = (evt: MouseEvent) => {
    evt.preventDefault();

    navigator.clipboard.writeText(props.manifest.uri).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 750);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal">
          <Share2 className="size-4" strokeWidth={2.2}/> Other IIIF Viewers <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="start"
        alignOffset={20}>
        <DropdownMenuItem asChild className="text-xs">
          <a 
            href={` https://samvera-labs.github.io/clover-iiif/docs/viewer/demo?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
            target="_blank">
            Clover
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-xs">
          <a 
            href={`https://demo.viewer.glycerine.io/viewer?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
            target="_blank">
            Glycerine
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-xs">
          <a 
            href={`https://liiive.now/?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
            target="_blank">
            liiive.now
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-xs">
          <a 
            href={`https://projectmirador.org/embed/?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
            target="_blank">
            Mirador
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-xs">
          <a 
            href={`https://theseusviewer.org/?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
            target="_blank">
            Theseus Viewer
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-xs">
          <a 
            href={`https://uv-v4.netlify.app/#?manifest=${encodeURIComponent(props.manifest.uri)}`}
            target="_blank">
            Universal Viewer
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={evt => evt.preventDefault} asChild>
          <button 
            onClick={onCopyManifestURL}
            className="w-full flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
            {copied ? (
              <ClipboardCheck className="size-4 text-green-700" /> 
            ) : (
              <IIIFIcon color className="size-4" />
            )} <span className="mt-[1px]">Copy Manifest URL</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}