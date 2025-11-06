import { Share2 } from 'lucide-react';
import { IIIFManifestResource } from '@/model';
import { 
  DropdownMenuItem,
  DropdownMenuPortal, 
  DropdownMenuSeparator, 
  DropdownMenuSub, 
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/ui/DropdownMenu';
import { CopyManifestURL } from '@/components/CopyManifestURL';

interface IIIFOpenInViewerActionProps {

  manifest: IIIFManifestResource;

}

export const IIIFOpenInViewerAction = (props: IIIFOpenInViewerActionProps) => {

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Share2 className="size-4 text-muted-foreground mr-2"  /> Other IIIF Viewers
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem>
            <a 
              href={`https://samvera-labs.github.io/clover-iiif/docs/viewer/demo?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
              target="_blank">
              Clover
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <a 
              href={`https://demo.viewer.glycerine.io/viewer?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
              target="_blank">
              Glycerine
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <a 
              href={`https://liiive.now/?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
              target="_blank">
              liiive.now
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <a 
              href={`https://projectmirador.org/embed/?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
              target="_blank">
              Mirador
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <a 
              href={`https://theseusviewer.org/?iiif-content=${encodeURIComponent(props.manifest.uri)}`}
              target="_blank">
              Theseus Viewer
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <a 
              href={`https://uv-v4.netlify.app/#?manifest=${encodeURIComponent(props.manifest.uri)}`}
              target="_blank">
              Universal Viewer
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <CopyManifestURL manifest={props.manifest} />
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )

}