import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Annotorious, ImageAnnotator } from '@annotorious/react';
import { Sidebar } from '@/components/Sidebar';
import { useStore } from '@/store';
import { AnnotoriousStorageAdapter } from './AnnotoriousStorageAdapter';
import { SaveStatusIndicator, SaveStatus } from './SaveStatusIndicator';

import './Annotate.css';
import '@annotorious/react/annotorious-react.css';

export const Annotate = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  const image = store?.getImage(params.id!);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const onSaving = () => setSaveStatus('saving');

  const onSaved = () => setSaveStatus('success');

  const onError = (error: Error) => {
    console.error(error);
    setSaveStatus('failed');
  }

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

        <SaveStatusIndicator status={saveStatus} />

        {image && (
          <section>
            <Annotorious>
              <ImageAnnotator>
                <img 
                  src={URL.createObjectURL(image.data)}
                  alt={image.path} />
              </ImageAnnotator>

              <AnnotoriousStorageAdapter
                image={image} 
                onSaving={onSaving}
                onSaved={onSaved}
                onError={onError} />
            </Annotorious>
          </section>
        )}
      </main>
    </div>
  )

}