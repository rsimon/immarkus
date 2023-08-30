import { useCollection } from '@/store';
import { ImageGrid } from './ImageGrid';

import './Images';
import { Sidebar } from '@/components/Sidebar';

export const Images = () => {

  const collection = useCollection({ redirect: true });

  return collection && (
    <div className="page-root">
      <Sidebar />

      <main className="page images">
        <ImageGrid />
      </main>
    </div>
  )

}