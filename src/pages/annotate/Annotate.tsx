import { Link, useParams } from 'react-router-dom';
import { Annotorious, ImageAnnotator } from '@annotorious/react';
import { Sidebar } from '@/components/Sidebar';
import { useCollection } from '@/store';

import './Annotate.css';

import '@annotorious/react/dist/annotorious-react.css';

export const Annotate = () => {

  const collection = useCollection({ redirect: true });

  const params = useParams();

  const image = collection?.images.find(i => i.name === params.id);

  return collection &&  (
    <div className="page-root">
      <Sidebar />

      <main className="page annotate">
        <nav className="breadcrumb">
          <ul>
            <li>
              <Link to="/images">Images</Link>
            </li>

            {image && (
              <li>
                {image.path}
              </li>
            )}
          </ul>
        </nav>

        {image && (
          <section>
            <Annotorious>
              <ImageAnnotator>
                <img 
                  src={URL.createObjectURL(image.data)}
                  alt={image.path} />
              </ImageAnnotator>
            </Annotorious>
          </section>
        )}
      </main>
    </div>
  )

}