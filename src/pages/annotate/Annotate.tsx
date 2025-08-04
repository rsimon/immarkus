import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnnotoriousManifold, OSDViewerManifold, PluginProvider, Plugin } from '@annotorious/react-manifold';
import { mountPlugin as BooleanPlugin } from '@annotorious/plugin-boolean-operations';
import { mountOpenSeadragonPlugin as SAMPlugin } from '@annotorious/plugin-segment-anything/openseadragon';
import { LoadedImage } from '@/model';
import { useImages } from '@/store';
import { TooltipProvider } from '@/ui/Tooltip';
import { HeaderSection } from './HeaderSection';
import { RelationEditorRoot } from './RelationEditor';
import { SavingState } from './SavingState';
import { SidebarSection } from './SidebarSection';
import { SmartToolsPanel } from './SmartTools';
import { AnnotationMode, Tool } from './AnnotationMode';
import { WorkspaceSection} from './WorkspaceSection';

import './Annotate.css';

import '@annotorious/plugin-segment-anything/annotorious-plugin-smart-tools.css';

export const Annotate = () => {

  const params = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const [imageIds, setImageIds] = useState(params.images.split('&'));

  const images = useImages(imageIds) as LoadedImage[];

  const [hideAnnotations, setHideAnnotations] = useState(false);

  const [mode, setMode] = useState<AnnotationMode>('move');

  const [tool, setTool] = useState<Tool>('rectangle');

  const [isSmartPanelOpen, setIsSmartPanelOpen] = useState(false);

  const onCloseSmartPanel = useCallback(() => {
    setMode('move');
    setIsSmartPanelOpen(false);
  }, []);

  useEffect(() => {
    // Update the imagesIds in case the params change
    const next = params.images.split('&');

    if (imageIds.join() !== next.join())
      setImageIds(next);
  }, [params]);

  useEffect(() => {
    const { pathname } = location;

    // Update the URL in response to image change
    const url = `/annotate/${imageIds.join('&')}`;

    if (pathname !== url)
      navigate(url);
  }, [imageIds]);

  const onAddImage = (imageId: string) =>
    setImageIds(ids => ([...ids, imageId]));

  const onChangeImage = (previousId: string, nextId: string) =>
    setImageIds(ids => ids.map(id => id === previousId ? nextId : id));

  return (
    <div className="page annotate h-full w-full">
      <TooltipProvider>
        <AnnotoriousManifold>
          <OSDViewerManifold>
            <RelationEditorRoot>
              <PluginProvider>
                <Plugin 
                  name="boolean" 
                  plugin={BooleanPlugin} />

                <Plugin
                  name="smart-selection"
                  plugin={SAMPlugin} />

                <SavingState.Root>
                  <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
                    <HeaderSection
                      images={images} 
                      isSmartPanelOpen={isSmartPanelOpen}
                      hideAnnotations={hideAnnotations}
                      mode={mode}
                      tool={tool}
                      onAddImage={onAddImage} 
                      onChangeImage={onChangeImage}
                      onChangeMode={setMode}
                      onChangeTool={setTool} 
                      onHideAnnotations={setHideAnnotations}
                      onToggleSmartPanel={() => setIsSmartPanelOpen(open => !open)} />

                    {images.length > 0 ? ( 
                      <WorkspaceSection 
                        images={images} 
                        hideAnnotations={hideAnnotations}
                        mode={mode}
                        tool={tool} 
                        onAddImage={onAddImage} 
                        onChangeImages={imageIds => setImageIds(imageIds)}
                        onRemoveImage={image => setImageIds(ids => ids.filter(id => id !== image.id))} />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted">
                        <Loader2 className="animate-spin size-5 opacity-50" />
                      </div>
                    )}

                    {isSmartPanelOpen && (
                      <SmartToolsPanel 
                        images={images}
                        mode={mode} 
                        tool={tool}
                        onChangeMode={setMode} 
                        onChangeTool={setTool}
                        onClosePanel={onCloseSmartPanel} />
                    )}
                  </main>

                  <SidebarSection />
                </SavingState.Root>
              </PluginProvider>
            </RelationEditorRoot>
          </OSDViewerManifold>
        </AnnotoriousManifold>
      </TooltipProvider>
    </div>
  )

}