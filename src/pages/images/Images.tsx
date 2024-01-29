import { Fragment, useMemo } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { ChevronRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import { ItemGrid } from './ItemGrid';
import { MetadataDrawer } from './MetadataDrawer';

export const Images = () => {

  const store = useStore();

  const { folder } = useParams();

  const navigate = useNavigate();

  const currentFolder = useMemo(() => folder ? store.getFolder(folder) : store.getRootFolder(), [folder]);
 
  if (!currentFolder)
    navigate('/404');

  const { folders, images } = useMemo(() => store.getFolderContents(currentFolder.handle), [currentFolder]);

  return store && (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page images flex flex-row p-0">
        <div className="flex-grow px-12 py-6">
          <div className="space-y-1 flex-grow">
            <h1 className="text-sm text-muted-foreground tracking-tight">
              {folder ? (
                <nav className="breadcrumbs" aria-label="Breadcrumbs">
                  <ol className="flex items-center gap-0.5">
                    <li>
                      <Link className="hover:underline" to={`/images`}>{store.getRootFolder().name}</Link>
                    </li>

                    <ChevronRight className="h-4 w-4" />

                    {currentFolder.path.map((id, idx) => (
                      <Fragment key={`${idx}-${id}`}>
                        <li key={`${idx}-${id}`}> 
                          <Link className="hover:underline" to={`/images/${id}`}>{store.getFolder(id).name}</Link>
                        </li>

                        <ChevronRight className="h-4 w-4" />
                      </Fragment>
                    ))}
                  </ol>
                </nav>
              ) : (
                <span>Folder</span>
              )}
            </h1>

            <h2 className="text-3xl font-semibold tracking-tight">
              {currentFolder.name}
            </h2>

            <p className="text-sm text-muted-foreground">
              {images.length} images
            </p>
          </div>

          <ItemGrid 
            folders={folders} 
            images={images} />
        </div>

        <div className="bg-red-400 w-[200px] relative" />
      </main>
    </div>
  )

}