import { FileJson } from 'lucide-react';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';

export const ExportDataModel = () => {

  const datamodel = useDataModel();

  const exportData = (data: any, filename: string) => {
    const str = JSON.stringify(data);
    const encoded = new TextEncoder().encode(str);
    const blob = new Blob([encoded], {
      type: 'application/json;charset=utf-8'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
  }

  return (
    <ul className="py-2 space-y-5">
      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            Entity Classes
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Your Entity Class model, in proprietary IMMARKUS JSON Format.
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel.entityTypes, 'entity-classes.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            Relationship Types
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Your Relationship Type model, in proprietary IMMARKUS JSON Format.
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel.relationshipTypes, 'relationship-types.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            Image Metadata Schemas
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Your Image Metadata schemas, in proprietary IMMARKUS JSON Format.
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel.imageSchemas, 'image-metadata-schema.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            Folder Metadata Schemas
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            Your Folder Metadata schemas, in proprietary IMMARKUS JSON Format.
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel.folderSchemas, 'folder-metadata-schema.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>

      <li>
        <div className="max-w-2xl py-4 px-6 bg-white border rounded">
          <h3 className="font-medium leading-relaxed">
            Full IMMARKUS Data Model
          </h3>

          <p className="text-sm pt-3 pb-5 leading-relaxed">
            All of the above - Entity Classes, Relationship Types, Image and Folder metadata schemas. This export is the same
            file you will find in your work foldder as <code className="text-muted-foreground">_immarkus.model.json</code>.  
            It is re-published here for convenience.
          </p>

          <div className="flex justify-end pt-3">
            <Button 
              className="whitespace-nowrap flex gap-3 w-36 justify-center"
              onClick={() => exportData(datamodel, '_immarkus.model.json')}>
              <FileJson className="h-5 w-5" /> JSON
            </Button>
          </div>
        </div>
      </li>
    </ul>
  )

}