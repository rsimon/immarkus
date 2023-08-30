import { Sidebar } from '@/components/Sidebar';
import { useStore } from '@/store';
import { ImageGrid } from './ImageGrid';

import './Images';

export const Images = () => {

  const store = useStore({ redirect: true });

  return store && (
    <div className="page-root">
      <Sidebar />

      <main className="page images">
        <ImageGrid />
      </main>
    </div>
  )

}