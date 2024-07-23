import { Button } from '@/ui/Button';
import { Graph, GraphNode } from '../../Types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';
import { ChevronDown, Download } from 'lucide-react';
import { useState } from 'react';
import { Image } from '@/model';
import { ExcelAnnotationExport } from '@/components/ExcelAnnotationExport';
import { useStore } from '@/store';

interface ExportSelectorProps {

  graph: Graph;

  query:((n: GraphNode) => boolean);

}

export const ExportSelector = (props: ExportSelectorProps) => {

  const store = useStore();

  const [imagesToExport, setImagesToExport] = useState<Image[] | undefined>();

  const onExportMetadata = () => {
    /*
    const matches = props.graph.nodes.filter(n => props.query!(n));
    exportImages(store, matches.map(m => m.id));
    */
  }

  const onExportAnnotations = () => {
    const matches = props.graph.nodes.filter(n => props.query!(n));
    const images = matches.filter(n => n.type === 'IMAGE').map(n => store.getImage(n.id));
    setImagesToExport(images);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            size="sm"
            className="flex items-center text-xs py-0 px-0 font-normal">
            <Download className="h-3.5 w-3.5 mr-1.5 mb-[1px]" /> 
            Export Search Result 
            <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={-5}>
          <DropdownMenuItem className="text-xs" onSelect={onExportMetadata}>
            Export image metadata
          </DropdownMenuItem>

          <DropdownMenuItem className="text-xs" onSelect={onExportAnnotations}>
            Export annotations
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {imagesToExport && (
        <ExcelAnnotationExport
          images={imagesToExport} 
          onComplete={() => setImagesToExport(undefined)} />
      )}
    </>
  )

}