import { FileJson } from 'lucide-react';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';

export const ExportDataModel = () => {

  const { entityTypes } = useDataModel();

  const exportDataModel = () => {
    const str = JSON.stringify({ entityTypes });
    const data = new TextEncoder().encode(str);
    const blob = new Blob([data], {
      type: 'application/json;charset=utf-8'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = '_immarkus.model.json';
    anchor.click();
  }

  return (
    <ul className="py-2">
      <li>
        <div className="max-w-xl py-2">
          <h3 className="font-medium leading-relaxed">
            IMMARKUS Data Model
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Your data model in proprietary IMMARKUS JSON format. This file is the 
            same you will find in your work folder as <code className="text-muted-foreground">_immarkus.model.json</code>, 
            and is re-published here for convenience.
          </p>

          <Button 
            className="whitespace-nowrap flex gap-3 w-36 justify-center"
            onClick={() => exportDataModel()}>
            <FileJson className="h-5 w-5" /> JSON
          </Button>
        </div>
      </li>
    </ul>
  )

}