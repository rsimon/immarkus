import { Button } from '@/ui/Button';
import { ChevronDown, Download, FileBarChart2 } from 'lucide-react';
import { useStore, useExcelAnnotationExport } from '@/store';
import { ExportProgressDialog } from '@/components/ExportProgressDialog';
import { Graph, GraphNode } from '../../Types';
import { exportImages } from './exportImages';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface ExportSelectorProps {

  graph: Graph;

  query:((n: GraphNode) => boolean);

}

export const ExportSelector = (props: ExportSelectorProps) => {

  const store = useStore();

  const { exportAnnotations, busy, progress } = useExcelAnnotationExport();

  const onExportMetadata = () => {
    const matches = props.graph.nodes.filter(n => props.query!(n));
    exportImages(store, matches.map(m => m.id));
  }

  const onExportAnnotations = () => {
    const matches = props.graph.nodes.filter(n => props.query!(n));
    const images = matches.filter(n => n.type === 'IMAGE').map(n => store.getImage(n.id));
    exportAnnotations(images, 'search_results_annotations.xlsx');
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

        <DropdownMenuContent 
          align="end"
          sideOffset={-5}>
          <DropdownMenuItem className="text-xs flex items-center" onSelect={onExportMetadata}>
            <FileBarChart2 className="w-3.5 h-3.5 mr-1.5 mb-0.5" />  Export metadata
          </DropdownMenuItem>

          <DropdownMenuItem className="text-xs flex items-center" onSelect={onExportAnnotations}>
            <FileBarChart2 className="w-3.5 h-3.5 mr-1.5 mb-0.5" /> Export annotations
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportProgressDialog 
        open={busy}
        message="Exporting XLSX. This may take a while."
        progress={progress} />
    </>
  )

}