import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Annotorious, AnnotoriousPlugin, ImageAnnotator, W3CImageFormat } from '@annotorious/react';
import { mountExtension as SelectorPack } from '@annotorious/selector-pack';
import { useStore } from '@/store';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { SaveStatus, SavingIndicator } from '@/components/SavingIndicator';
import { useToast } from '@/ui/Toaster';
import { EditorPanel } from './EditorPanel';
import { StoragePlugin } from './StoragePlugin';
import { Tool, Toolbar } from './Toolbar';

import '@annotorious/react/annotorious-react.css';

export const Annotate = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  const image = store?.getImage(params.id!);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const [tool, setTool] = useState<Tool>('rectangle');

  const { toast } = useToast();

  const onSaving = () => setSaveStatus('saving');

  const onSaved = () => setSaveStatus('success');

  const onError = (error: Error) => {
    setSaveStatus('failed');

    toast({
      title: 'Something went wrong',
      description: `There was an error saving annotation. Message: ${error}`
    });
  }

  return store &&  (
    <div className="page-root">
      <Annotorious>
        <NavigationSidebar />

        <main className="page annotate">
          <nav className="breadcrumb">
            <ul>
              <li>
                <Link className="font-semibold" to="/images">Images</Link>
              </li>

              {image && (
                <li>
                  {image.path}
                </li>
              )}
            </ul>
          </nav>

          <SavingIndicator status={saveStatus} />

          {image && (
            <section>
              <Toolbar 
                tool={tool}
                onToolChange={setTool}/>

              <ImageAnnotator
                adapter={W3CImageFormat(image.path)}
                autoSave={true}
                tool={tool}>
                <img 
                  className="select-none"
                  src={URL.createObjectURL(image.data)}
                  alt={image.path} />
              </ImageAnnotator>

              {/* @ts-ignore */}
              <AnnotoriousPlugin
                // @ts-ignore 
                plugin={SelectorPack} />

              <StoragePlugin
                image={image} 
                onSaving={onSaving}
                onSaved={onSaved}
                onError={onError} />
            </section>
          )}
        </main>

        <aside className="border-l p-3">
          <EditorPanel 
            image={image} 
            onSaving={onSaving} 
            onSaved={onSaved}
            onError={onError} />
        </aside>
      </Annotorious>
    </div>
  )

}