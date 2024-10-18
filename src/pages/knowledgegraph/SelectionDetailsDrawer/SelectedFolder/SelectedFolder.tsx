import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderIcon, FolderOpen, ImageIcon, X } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { PropertyValidation } from '@/components/PropertyFields';
import { FolderMetadataForm, hasChanges } from '@/components/MetadataForm';
import { Folder } from '@/model';
import { useFolderMetadata, useStore } from '@/store';
import { Button } from '@/ui/Button';

interface SelectedFolderProps {

  folder: Folder;

  onClose(): void;

}

export const SelectedFolder = (props: SelectedFolderProps) => {

  const { folder } = props;

  const store = useStore();

  const [imageCount, folderCount] = useMemo(() => {
    const items = store.getFolderContents(folder.handle);
    return [items.images.length, items.folders.length];
  }, [folder, store]);

  const { metadata, updateMetadata } = useFolderMetadata(folder);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    updateMetadata(formState);
  }

  return (
    <div className="p-2">
      <article className="flex flex-col">
        <div className="bg-white rounded border shadow-sm">
          <div className="px-3 py-2 pr-2 flex justify-between items-center overflow-hidden gap-2">
            <h2 className="flex gap-1.5 items-center whitespace-nowrap overflow-hidden text-sm">
              <FolderOpen className="h-4 w-4" /> 
              <div className="overflow-hidden text-ellipsis">{folder.name}</div>
            </h2>

            <Button 
              className="h-8 w-8 right-1.5 top-1.5 rounded"
              size="icon"
              variant="ghost"
              onClick={props.onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3 pr-2.5 flex justify-between border-t items-center text-xs">
            <div className="text-muted-foreground flex gap-4">
              {imageCount > 0 && (
                <div className="flex gap-1 items-center">
                  <ImageIcon className="h-3.5 w-3.5" /> {imageCount} Images
                </div>
              )}

              {folderCount > 0 && (
                <div className="flex gap-1 items-center">
                  <FolderIcon className="h-3.5 w-3.5" /> {folderCount} Sub-Folders
                </div>
              )}
            </div>

            <Link 
              to={`/images/${folder.id}`}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 py-1.5">
              Open
            </Link>
          </div>
        </div>

        <PropertyValidation>
          <form 
            onSubmit={onSubmit} 
            className="bg-white p-3 rounded border shadow-sm mt-2">
            <div className="flex flex-col flex-grow">          
              <FolderMetadataForm
                metadata={formState}
                onChange={setFormState} />
            </div>

            <div className="pt-2">        
              <Button 
                disabled={!hasChanges(metadata, formState)} 
                className="w-full mb-2"
                type="submit">
                Save
              </Button>
            </div>
          </form>
        </PropertyValidation> 
      </article>
    </div>
  )

}