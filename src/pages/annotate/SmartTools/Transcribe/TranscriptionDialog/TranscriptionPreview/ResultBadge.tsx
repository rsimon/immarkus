import { ScanText } from 'lucide-react';
import { Button } from '@/ui/Button';

interface ResultBadgeProps {

  count: number;

  onImport(): void;

}

export const ResultBadge = (props: ResultBadgeProps) => {

  return (
    <div 
      className="absolute bottom-2 left-2 z-10 bg-black text-white py-2 pl-3 pr-2 rounded-md shadow-md flex gap-5">
      <div className="flex gap-2 text-sm items-center font-light">
        <ScanText className="size-4.5 mb-[1px]" />
        {props.count.toLocaleString()} Annotations
      </div>

      <Button
        className="h-8 rounded-sm bg-green-600"
        onClick={props.onImport}>
        Import to IMMARKUS
      </Button>
    </div>
  )

}