import { Link, useNavigate, useParams } from 'react-router-dom';
import { Annotorious } from '@annotorious/react';
import { Sidebar } from '@/components/Sidebar';
import { useCollection } from '@/store';

import './Annotate.css';

export const Annotate = () => {

  const navigate = useNavigate();

  const collection = useCollection();

  if (!collection) {
    navigate('/');
    return null;
  }

  const params = useParams();

  const image = collection.images.find(i => i.name === params.id);

  return (
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

                <img 
                  src={URL.createObjectURL(image.data)}
                  alt={image.path} />



            </Annotorious>
          </section>
        )}
      </main>
    </div>
  )

}