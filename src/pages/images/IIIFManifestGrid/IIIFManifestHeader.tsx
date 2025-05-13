import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import murmur from 'murmurhash';
import { CozyTOCNode } from 'cozy-iiif';
import { ChevronRight, NotebookPen } from 'lucide-react';
import { IIIFIcon } from '@/components/IIIFIcon';
import { IIIFManifestResource } from '@/model';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { FilterByAnnotations, IIIFOpenOtherViewer } from '../HeaderControls';

interface IIIFManifestHeaderProps {
  
  breadcrumbs: CozyTOCNode[];

  manifest: IIIFManifestResource;

  hideUnannotated: boolean;

  onChangeHideUnannotated(hide: boolean): void;

  onShowMetadata(): void;
  
}

export const IIIFManifestHeader = (props: IIIFManifestHeaderProps) => {

  const { manifest, breadcrumbs } = props;

  const store = useStore();

  const title = (breadcrumbs && breadcrumbs.length) > 0 
    ? breadcrumbs[breadcrumbs.length - 1].getLabel()
    : manifest.name;

  // The path is:
  // - the actual path on the file system 
  // - if there are breadcrumbs: 
  // - the manifest + breadcrumbs
  const path = [
    ...manifest.path.map(id => ({ id, label: store.getFolder(id).name })),
    ...(breadcrumbs && breadcrumbs.length) > 0 
        ? [{ id: manifest.id, label: manifest.name }] : [], 
    ...(breadcrumbs 
        ? breadcrumbs.slice(0, -1).map(b => ({ id: `${manifest.id}@${murmur.v3(b.id)}`, label: b.getLabel() })) : [])
  ];

  return (
    <div className="space-y-1 grow">
      <h1 className="text-sm text-muted-foreground tracking-tight">
        <nav className="breadcrumbs" aria-label="Breadcrumbs">
          <ol className="flex items-center gap-0.5">
            <li>
              <Link className="hover:underline" to={`/images`}>{store.getRootFolder().name}</Link>
            </li>

            <ChevronRight className="h-4 w-4" />

            {path.map(({ id, label }, idx) => (
              <Fragment key={`${idx}-${id}`}>
                <li 
                  key={`${idx}-${id}`}
                  className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[20ch]">
                  <Link className="hover:underline" to={`/images/${id}`}>{label}</Link>
                </li>

                <ChevronRight className="h-4 w-4" />
              </Fragment>
            ))}
          </ol>
        </nav>
      </h1>

      <h2 className="text-3xl font-semibold leading-snug tracking-tight -ml-0.5">
        {title}
      </h2>

      <p className="text-sm text-muted-foreground flex gap-2 pt-1 items-center">
        <IIIFIcon
          color
          className="size-5 -translate-y-0.5" />
        <span>·</span> 

        <span>{manifest.canvases.length} images</span>
        <span>·</span> 
        <Button 
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal"
          onClick={props.onShowMetadata}>
          <NotebookPen className="size-4" /> Metadata
        </Button>

        <span>·</span> 
        <IIIFOpenOtherViewer manifest={manifest} />

        <span>·</span>
        <FilterByAnnotations 
          hideUnannotated={props.hideUnannotated} 
          onChangeHideUnannotated={props.onChangeHideUnannotated} />
      </p>
    </div>
  )

}