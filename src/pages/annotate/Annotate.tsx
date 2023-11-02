import { useState } from 'react';
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
import { colorByEntity } from './annotationStyles';

// 'Feature toggle' for future use
const DISPLAY_MODE: 'image' | 'osd' = 'image';

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
    <div className="page-root page annotate">
      <Annotorious>
        <main 
          className={DISPLAY_MODE === 'image' ? 
            'bg-muted relative p-0 flex flex-col overflow-hidden' : 'bg-muted relative p-0'}>
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
            <div 
              className={DISPLAY_MODE === 'image' ?
                'flex justify-center items-center z-0 flex-grow pb-12' :
                'h-full w-full'}>
              
              {DISPLAY_MODE === 'image' ? (
                <ImageAnnotator
                  // @ts-ignore
                  adapter={W3CImageFormat(image.path)}
                  autoSave={true}
                  style={colorByEntity(store)}
                  tool={tool}>
                  <img 
                    className="select-none"
                    src={URL.createObjectURL(image.data)}
                    alt={image.path} />
                </ImageAnnotator>
              ) : (
                <OpenSeadragonAnnotator
                  adapter={W3CImageFormat(image.path)}
                  tool={tool}>
                  <OpenSeadragonViewer
                    className="osd-container"
                    options={{
                      tileSources: {
                        type: 'image',
                        url: URL.createObjectURL(image.data)
                      },
                      gestureSettingsMouse: {
                        clickToZoom: false
                      },
                      showNavigationControl: false,
                      crossOriginPolicy: 'Anonymous'
                    }} />
                </OpenSeadragonAnnotator>
              )}

              {/* @ts-ignore */}
              <AnnotoriousPlugin
                // @ts-ignore 
                plugin={SelectorPack} />

              <StoragePlugin
                image={image} 
                onSaving={onSaving}
                onSaved={onSaved}
                onError={onError} />
            </div>
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
      </Annotorious>
    </div>
  )

}