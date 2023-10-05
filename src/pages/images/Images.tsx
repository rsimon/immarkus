import { NavigationSidebar } from '@/components/NavigationSidebar';
import { useStore } from '@/store';
import { ImageGrid } from './ImageGrid';

import './Images';

export const Images = () => {

  const store = useStore({ redirect: true });

  return store && (
    <div className="page-root">
      <NavigationSidebar />

      <main className="page images">
        <ImageGrid />
      </main>
    </div>
  )

}