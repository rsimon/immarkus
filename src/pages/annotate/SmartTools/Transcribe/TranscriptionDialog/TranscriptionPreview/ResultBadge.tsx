import { FileWarning, ScanText, Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '@/ui/Button';

interface ResultBadgeProps {

  count: number;

  onClear(): void;

  onImport(): void;

}

export const ResultBadge = (props: ResultBadgeProps) => {

  return props.count > 0 ? (
    <div 
      className="absolute bottom-2 left-2 z-10 bg-black text-white py-1.5 pl-3 pr-2 rounded-md shadow-md flex gap-8 items-center">
      
      <div className="flex gap-2 text-sm items-center font-light whitespace-nowrap">
        <ScanText className="size-4.5" />
        {props.count.toLocaleString()} Annotations

        <button 
          className="rounded p-2 hover:bg-white/25 -ml-1"
          onClick={props.onClear}>
          <Trash2 className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      <Button
        className="h-8 rounded-sm bg-green-600 whitespace-nowrap"
        onClick={props.onImport}>
        Import to IMMARKUS
      </Button>
    </div>
  ) : (
    <div 
      className="absolute bottom-2 left-2 z-10 bg-black text-white py-1.5 pl-3 pr-3.5 rounded-md shadow-md flex gap-8 items-center">
      <div className="flex gap-2 h-7 text-sm items-center font-light whitespace-nowrap">
        <FileWarning className="size-4.5" />
        No Results
      </div>
    </div>
  )

}