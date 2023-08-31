import { Link, useParams } from 'react-router-dom';
import { Annotorious, ImageAnnotator } from '@annotorious/react';
import { Sidebar } from '@/components/Sidebar';
import { useStore } from '@/store';
import { AnnotoriousStorePlugin } from './AnnotoriousStorePlugin';

import './Annotate.css';
import '@annotorious/react/dist/annotorious-react.css';

export const Annotate = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  const image = store?.getImage(params.id!);

  return store &&  (
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

              <AnnotoriousStorePlugin 
                image={image} />
            </Annotorious>
          </section>
        )}
      </main>
    </div>
  )

}