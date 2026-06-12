import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, NotebookPen } from 'lucide-react';
import { Folder, RootFolder } from '@/model';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Sorting } from '@/utils/useImageSorting';
import { isRootFolder, OverviewLayout } from '../../Types';
import { IIIFImporter } from '../../IIIFImporter';
import { FilterByAnnotations, ToggleLayout } from '../../HeaderControls';
import { GridSorting } from './GridSorting';

interface FolderHeaderProps {

  folder: Folder | RootFolder;

  hideUnannotated: boolean;

  layout: OverviewLayout;

  sorting: Sorting;

  onSetLayout(layout: OverviewLayout): void;

  onShowMetadata(): void;

  onChangeHideUnannotated(hide: boolean): void;

  onChangeSorting(sorting: Sorting): void;

}

export const FolderHeader = (props: FolderHeaderProps) => {

  const { folder } = props;

  const store = useStore();

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

      <p className="text-sm text-muted-foreground flex gap-5 pt-1 items-center">
        <Button 
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal ring-offset-2 rounded"
          onClick={props.onShowMetadata}>
          <NotebookPen className="size-4" /> Metadata
        </Button>

        <IIIFImporter 
          folderId={'id' in folder ? folder.id : undefined} />

        <FilterByAnnotations 
          hideUnannotated={props.hideUnannotated} 
          onChangeHideUnannotated={props.onChangeHideUnannotated} />

        <ToggleLayout 
          layout={props.layout} 
          onSetLayout={props.onSetLayout} />

        {props.layout === 'grid' && (
          <GridSorting 
            sorting={props.sorting} 
            onChange={props.onChangeSorting} />
        )}
      </p>
    </div>
  )

}