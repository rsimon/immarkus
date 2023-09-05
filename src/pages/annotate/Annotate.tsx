import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Annotorious, ImageAnnotator } from '@annotorious/react';
import { useStore } from '@/store';
import { Sidebar } from '@/components/Sidebar';
import { AnnotoriousAdapter } from './AnnotoriousAdapter';
import { EditorSidebar } from './EditorPane';
import { SaveStatusIndicator, SaveStatus } from './SaveIndicator';
import { Tool, Toolbar } from './Toolbar';

import './Annotate.css';
import '@annotorious/react/annotorious-react.css';

export const Annotate = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  const image = store?.getImage(params.id!);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const [tool, setTool] = useState<Tool>('rectangle');

  const onSaving = () => setSaveStatus('saving');

  const onSaved = () => setSaveStatus('success');

  const onError = (error: Error) => {
    console.error(error);
    setSaveStatus('failed');
  }

  return store &&  (
    <div className="page-root">
      <Annotorious>
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
              <Toolbar 
                tool={tool}
                onToolChange={setTool}/>

              <ImageAnnotator
                tool={tool}>
                <img 
                  className="select-none"
                  src={URL.createObjectURL(image.data)}
                  alt={image.path} />
              </ImageAnnotator>

              <AnnotoriousAdapter
                image={image} 
                onSaving={onSaving}
                onSaved={onSaved}
                onError={onError} />
            </section>
          )}
        </main>

        <EditorSidebar 
          image={image} 
          onSaving={onSaving} 
          onSaved={onSaved}
          onError={onError} />
      </Annotorious>
    </div>
  )

}