import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '@/store';
import { ImageGrid } from './ImageGrid';

import './Images';
import { Sidebar } from '@/components/Sidebar';

export const Images = () => {

  const navigate = useNavigate();

  const collection = useCollection();

  useEffect(() => {
    if (!collection)
      navigate('/');
  }, []);
  
  return collection && (
    <div className="page-root">
      <Sidebar />

      <main className="page images">
        <ImageGrid />
      </main>
    </div>
  )

}