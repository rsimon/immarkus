import { useState } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { Link, useParams } from 'react-router-dom';
import { Annotorious, AnnotoriousPlugin, ImageAnnotator, OpenSeadragonAnnotator, OpenSeadragonViewer, W3CImageFormat } from '@annotorious/react';
import { mountExtension as SelectorPack } from '@annotorious/selector-pack';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '@/store';
import { SaveStatus, SavingIndicator } from '@/components/SavingIndicator';
import { useToast } from '@/ui/Toaster';
import { EditorPanel } from './EditorPanel';
import { StoragePlugin } from './StoragePlugin';
import { Tool, Toolbar } from './Toolbar';

import './Annotate.css';
import '@annotorious/react/annotorious-react.css';
import 'react-mosaic-component/react-mosaic-component.css';

export type ViewId = 'a' | 'b' | 'c' | 'new';

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

  const TITLE_MAP: Record<ViewId, string> = {
    a: 'Left Window',
    b: 'Top Right Window',
    c: 'Bottom Right Window',
    new: 'New Window',
  };
  
  return store &&  (
    <div className="page-root page annotate">
      <main className="bg-muted relative p-0">
        <div className="absolute">
          <nav className="p-3 pr-4 bg-white inline-block border-r rounded-br-lg shadow-md relative z-10">
            <ul className="flex text-sm">
              <li className="inline-block">
                <Link className="font-semibold" to="/images">
                  <ChevronLeft className="h-5 w-5 mr-1" />
                </Link>
              </li>

              {image && (
                <li className="inline-block font-medium">
                  {image.name}
                </li>
              )}
            </ul>
          </nav>
        </div>

        <SavingIndicator status={saveStatus} />

        {image && (

          <Mosaic<ViewId>
              renderTile={(id, path) => (
                <MosaicWindow<ViewId> path={path} createNode={() => 'new'} title={TITLE_MAP[id]}>
                  <h1>{TITLE_MAP[id]}</h1>
                </MosaicWindow>
              )}
              initialValue={{
                direction: 'row',
                first: 'a',
                second: {
                  direction: 'column',
                  first: 'b',
                  second: 'c',
                },
              }}
            />

        )}

        <div className="pointer-events-none">          
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
            <Toolbar 
              tool={tool}
              onToolChange={setTool}/>
          </div>
        </div>
      </main>

      <aside className="border-l p-3 overflow-y-auto w-[340px] basis-[340px] grow-0 shrink-0">
        <EditorPanel 
          image={image} 
          onSaving={onSaving} 
          onSaved={onSaved}
          onError={onError} />
      </aside>
    </div>
  )

}