import { Button } from '@/ui/Button';
import { ChevronDown, Download, FileBarChart2, Table2 } from 'lucide-react';
import { useStore, useExcelAnnotationExport, useExcelRelationshipExport } from '@/store';
import { ProgressDialog } from '@/components/ProgressDialog';
import { Graph, GraphNode, GraphNodeType } from '../../Types';
import { getRelationships } from './exportRelationships';
import { useMetadataExport } from './useMetadataExport';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface ExportSelectorProps {

  objectType: GraphNodeType;

  graph: Graph;

  query:((n: GraphNode) => boolean);

}

export const ExportSelector = (props: ExportSelectorProps) => {

  const store = useStore();

  const {
    exportFolders,
    exportImages,
    busy: busyMetadata,
    progress: progressMetadata
  } = useMetadataExport();

  const { 
    exportAnnotations, 
    busy: busyAnnotations, 
    progress: progressAnnotations 
  } = useExcelAnnotationExport();

  const { 
    exportRelationships, 
    busy: busyRelations, 
    progress: progressRelations 
  } = useExcelRelationshipExport();

  const busy = busyMetadata || busyAnnotations || busyRelations;

  const progress = 
    busyMetadata ? progressMetadata :
    busyAnnotations ? progressAnnotations : 
    busyRelations ? progressRelations : 0;

  const onExportMetadata = () => {
    const matches = props.graph.nodes
      .filter(n => props.query!(n))
      .map(m => m.id);

    if (props.objectType === 'IMAGE')
      exportImages(matches);
    else if (props.objectType === 'FOLDER')
      exportFolders(matches);
  }

  const onExportAnnotations = () => {
    const matches = props.graph.nodes.filter(n => props.query!(n));
    const images = matches.filter(n => n.type === 'IMAGE').map(n => 
      n.id.startsWith('iiif:') ? store.getCanvas(n.id) : store.getImage(n.id));

    exportAnnotations(images, 'search_results_annotations.xlsx');
  }

  const onExportRelationships = () => {
    const matches = props.graph.nodes.filter(n => props.query!(n));
    const relationships = getRelationships(props.graph, matches);
    exportRelationships(store, relationships, 'search_results_relations.xlsx');
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            size="sm"
            className="flex items-center text-xs py-0 px-0 font-normal">
            <Download className="h-3.5 w-3.5 mr-1.5 mb-px" /> 
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

          <DropdownMenuItem className="text-xs flex items-center" onSelect={onExportRelationships}>
            <FileBarChart2 className="w-3.5 h-3.5 mr-1.5 mb-0.5" /> Export relationships
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProgressDialog 
        icon={<Table2 className="h-5 w-5" />}
        open={busy}
        message="Exporting XLSX. This may take a while."
        progress={progress} />
    </>
  )

}