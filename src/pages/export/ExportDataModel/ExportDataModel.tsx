import { Download } from 'lucide-react';
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
        <section className="w-full py-2 flex flex-row gap-20 justify-between">
          <div>
            <h3 className="font-medium mb-1 leading-relaxed">
              IMMARKUS Data Model
            </h3>

            <p className="text-sm leading-relaxed">
              Your data model in the original, proprietary IMMARKUS JSON format. This file is the 
              same you will find in your work folder as <code className="text-muted-foreground">_immarkus.model.json</code>, 
              and is re-published here for convenience.
            </p>
          </div>

          <div>
            <Button 
              className="whitespace-nowrap flex gap-2"
              onClick={() => exportDataModel()}>
              <Download className="h-4 w-4" /> JSON
            </Button>
          </div>
        </section>
      </li>
    </ul>
  )

}