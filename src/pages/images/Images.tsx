import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '@/store';

import './Images';

export const Images = () => {

  const navigate = useNavigate();

  const collection = useCollection();

  useEffect(() => {
    if (!collection)
      navigate('/');
  }, []);
  
  return (
    <main className="page images">
      <ul>
        {collection?.images.map(image => (
          <li key={image.name}>
            <img
              src={URL.createObjectURL(image.blob)}
              alt={image.name}
              className="h-auto w-auto object-cover transition-all hover:scale-105 aspect-square" />
          </li>
        ))}
      </ul>
    </main>
  )

}