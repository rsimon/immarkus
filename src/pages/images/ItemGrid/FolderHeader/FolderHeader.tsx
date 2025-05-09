import { Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownUp, ChevronDown, ChevronRight, LayoutGrid, NotebookPen } from 'lucide-react';
import { Folder, RootFolder } from '@/model';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { isRootFolder } from '../../Types';
import { IIIFImporter } from '../../IIIFImporter';
import { FilterByAnnotations } from '../../HeaderControls';

interface FolderHeaderProps {

  folder: Folder | RootFolder;

  hideUnannotated: boolean;

  onShowMetadata(): void;

  onChangeHideUnannotated(hide: boolean): void;

}

export const FolderHeader = (props: FolderHeaderProps) => {

  const { folder } = props;

  const store = useStore();

  const images = useMemo(() => {
    return store.getFolderContents(folder.handle)?.images.length || 0;
  }, [folder, store]);

  return (
    <div className="space-y-1 grow">
      <h1 className="text-sm text-muted-foreground tracking-tight">
        {isRootFolder(folder) ? (
          <span>Folder</span>
        ) : (
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            <ol className="flex items-center gap-0.5">
              <li>
                <Link className="hover:underline" to={`/images`}>{store.getRootFolder().name}</Link>
              </li>

              <ChevronRight className="h-4 w-4" />

              {(folder as Folder).path.map((id, idx) => (
                <Fragment key={`${idx}-${id}`}>
                  <li key={`${idx}-${id}`}> 
                    <Link className="hover:underline" to={`/images/${id}`}>{store.getFolder(id).name}</Link>
                  </li>

                  <ChevronRight className="h-4 w-4" />
                </Fragment>
              ))}
            </ol>
          </nav>
        )}
      </h1>

      <h2 className="text-3xl font-semibold leading-snug tracking-tight -ml-0.5">
        {folder.name}
      </h2>

      <p className="text-sm text-muted-foreground flex gap-2 pt-1 items-center">
        <span>{images} images</span>
        <span>·</span> 
        <Button 
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal"
          onClick={props.onShowMetadata}>
          <NotebookPen className="size-4" /> Metadata
        </Button>

        <span>·</span> 
        <IIIFImporter 
          folderId={'id' in folder ? folder.id : undefined} />

        <span>·</span>
        <FilterByAnnotations 
          hideUnannotated={props.hideUnannotated} 
          onChangeHideUnannotated={props.onChangeHideUnannotated} />

        <span>·</span>
        <LayoutGrid className="size-4.5" /> 
        <Button 
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal">
          Show as grid 
        </Button>
        <ChevronDown className="size-3.5" />

        <span>·</span>
        <ArrowDownUp className="size-4" />
        <Button 
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal">
          Sort 
        </Button>
        <ChevronDown className="size-3.5" />
      </p>
    </div>
  )

}