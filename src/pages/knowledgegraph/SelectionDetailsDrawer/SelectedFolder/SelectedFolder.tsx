import { FormEvent, useEffect, useMemo, useState } from 'react';
import murmur from 'murmurhash';
import { Link } from 'react-router-dom';
import { Braces, FolderIcon, FolderOpen, ImageIcon, NotebookPen, X } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { PropertyValidation } from '@/components/PropertyFields';
import { FolderMetadataForm, hasChanges } from '@/components/MetadataForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/Tabs';
import { Folder, IIIFManifestResource } from '@/model';
import { useFolderMetadata, useManifestMetadata, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { GraphNode } from '../../Types';
import { IIIFMetadataList } from '@/components/IIIFMetadataList';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { fetchManifest } from '@/utils/iiif';
import { CozyRange } from 'cozy-iiif';

interface SelectedFolderProps {

  folder: GraphNode;

  onClose(): void;

}

interface MetadataProps {

  metadata: W3CAnnotationBody;

  onUpdate(updated: W3CAnnotationBody): void;

}

const Metadata = (props: MetadataProps) => {

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(props.metadata);    
  }, [props.metadata]);

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    props.onUpdate(formState);
  }

  return (
    <PropertyValidation>
      <form 
        onSubmit={onSubmit}>
        <div className="flex flex-col grow">          
          <FolderMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

        <div className="pt-2">        
          <Button 
            disabled={!hasChanges(props.metadata, formState)} 
            className="w-full mb-2"
            type="submit">
            Save
          </Button>
        </div>
      </form>
    </PropertyValidation> 
  )

}

const SelectedFolderMetadata = ({ folder }: { folder: Folder }) => {

  const { metadata, updateMetadata } = useFolderMetadata(folder);

  return (
    <div className="bg-white px-4 py-3 rounded border shadow-xs mt-2">
      <Metadata metadata={metadata} onUpdate={updateMetadata} />
    </div>
  )

}

const SelectedManifestMetadata = ({ manifest }: { manifest: IIIFManifestResource }) => {

  const cozyManifest = useIIIFResource(manifest.id);

  const { metadata, updateMetadata } = useManifestMetadata(manifest.id);

  return cozyManifest ? (
    <div className="bg-white shadow-xs rounded border px-4 py-3 mt-2">
      <Tabs 
        defaultValue="iiif">
        <TabsList className="grid grid-cols-2 w-auto p-1 h-auto">
          <TabsTrigger 
            value="iiif"
            className="text-xs py-1 flex gap-1.5">
            <Braces className="size-3.5" /> IIIF
          </TabsTrigger>

          <TabsTrigger 
            value="my"
            className="text-xs py-1 px-2 flex gap-1.5">
            <NotebookPen className="size-3.5" /> My
          </TabsTrigger>
        </TabsList>

        <TabsContent 
          value="my">
          <Metadata metadata={metadata} onUpdate={updateMetadata} />
        </TabsContent>

        <TabsContent value="iiif"
          className="grow pb-4">
          <IIIFMetadataList 
            metadata={cozyManifest.getMetadata()} />
        </TabsContent>
      </Tabs>
    </div>
  ) : null;

}

export const SelectedFolder = (props: SelectedFolderProps) => {

  const store = useStore();

  const [folder, setFolder] = useState<IIIFManifestResource | Folder | CozyRange | undefined>();

  useEffect(() => {
    const { id } = props.folder;

    if (id.startsWith('iiif:')) {
      if (id.includes('@')) {
        // Manifest Range ID
        const [manifestId, rangeId] = id.substring('iiif:'.length).split('@');

        const manifest =  store.getIIIFResource(manifestId) as IIIFManifestResource;
        fetchManifest(manifest.uri).then(parsed => {
          const range = parsed.structure.find(range => {
            const hash = murmur.v3(range.id);
            return rangeId === hash.toString();
          });

          if (!range) {
            console.error('Range not found', manifestId, rangeId);
          } else {
            setFolder(range);
          }
        });
      } else {
        // Manifest ID
        const manifestId = id.substring('iiif:'.length);
        setFolder(store.getIIIFResource(manifestId) as IIIFManifestResource);
      }
    } else {
      setFolder(store.getFolder(props.folder.id) as Folder);
    }
  }, [props.folder]);

  const [imageCount, folderCount] = useMemo(() => {
    if (!folder) return [0, 0];

    if ('items' in folder) {
      const { navItems, navSections } = (props.folder.properties || {});
      return [(navItems || []).length, (navSections || []).length];
    } else if ('canvases' in folder) {
      return [folder.canvases.length, 0];
    } else {
      const items = store.getFolderContents(folder.handle);
      return [items.images.length, items.folders.length];
    }
  }, [folder, store]);

  const folderName = folder && ('name' in folder ? folder.name : folder.getLabel());

  const folderId = folder && ('items' in folder ? props.folder.id.substring(5) : folder.id);

  return folder && (
    <div className="p-2">
      <article className="flex flex-col">
        <div className="bg-white rounded border shadow-xs">
          <div className="px-3 py-2 pr-2 flex justify-between items-center overflow-hidden gap-2">
            <h2 className="flex gap-1.5 items-center whitespace-nowrap overflow-hidden text-sm">
              <FolderOpen className="h-4 w-4" /> 
              <div className="overflow-hidden text-ellipsis">{folderName}</div>
            </h2>

            <Button 
              className="h-8 w-8 right-1.5 top-1.5 rounded-full"
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
              to={`/images/${folderId}`}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 py-1.5">
              Open
            </Link>
          </div>
        </div>

        {('type' in folder && folder.type === 'PRESENTATION_MANIFEST') ? (
          <SelectedManifestMetadata manifest={folder} />
        ) : !('canvases' in folder) ? (
          <SelectedFolderMetadata folder={folder} />
        ) : null}
      </article>
    </div>
  )

}