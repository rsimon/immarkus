import { Download } from 'lucide-react';
import { DropdownMenuItem } from '@/ui/DropdownMenu';

interface IIIFExportActionProps {

  onSelect(): void;

}

export const IIIFExportAction = (props: IIIFExportActionProps) => {

  return (
    <DropdownMenuItem onSelect={props.onSelect}>
      <Download className="size-4 text-muted-foreground mr-2" /> Export IIIF manifest
    </DropdownMenuItem>
  )

}