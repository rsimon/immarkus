import { NavigationSidebar } from '@/components/NavigationSidebar';
import { useStore } from '@/store';
import { useParams } from 'react-router-dom';
import { ImageGrid } from './ImageGrid';

export const Images = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  return store && (
    <div className="page-root">
      <NavigationSidebar />

      <main className="page images">
        <ImageGrid folderId={params.folder} />
      </main>
    </div>
  )

}