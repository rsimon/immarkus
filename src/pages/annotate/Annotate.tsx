import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnnotoriousManifold } from '@annotorious/react-manifold';
import { Image } from '@/model';
import { useStore } from '@/store';
import { HeaderSection, ToolMode, Tool } from './HeaderSection';
import { OSDViewerManifold } from './OSDViewerManifold';
import { SavingState } from './SavingState';
import { SidebarSection } from './SidebarSection';
import { WorkspaceSection} from './WorkspaceSection';

import './Annotate.css';
<<<<<<< HEAD
import '@annotorious/react/annotorious-react.css';
import { colorByEntity } from './annotationStyles';

// 'Feature toggle' for future use
const DISPLAY_MODE: 'image' | 'osd' = 'image';
=======
>>>>>>> multi-image

export const Annotate = () => {

  const store = useStore({ redirect: true });

  const navigate = useNavigate();

  const params = useParams();

  const [images, setImages] = 
    useState<Image[]>(params.images.split('&').map(id => store?.getImage(id)).filter(Boolean));

  const [tool, setTool] = useState<Tool>('rectangle');

  const [mode, setMode] = useState<ToolMode>('move');

  useEffect(() => {
    // Update the URL in response to image change
    navigate(`/annotate/${images.map(i => i.id).join('&')}`);
  }, [images]);

<<<<<<< HEAD
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
=======
  return (
    <div className="page annotate h-full w-full">
      <AnnotoriousManifold>
        <OSDViewerManifold>
          <SavingState.Root>
            <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
              <HeaderSection
                images={images} 
                mode={mode}
>>>>>>> multi-image
                tool={tool}
                onAddImage={image => setImages(images => ([...images, image]))} 
                onChangeMode={setMode}
                onChangeTool={setTool} />

              <WorkspaceSection 
                images={images} 
                mode={mode}
                tool={tool} 
                onRemoveImage={image => setImages(images => images.filter(i => i.id !== image.id))} />
            </main>

            <SidebarSection />
          </SavingState.Root>
        </OSDViewerManifold>
      </AnnotoriousManifold>
    </div>
  )

}