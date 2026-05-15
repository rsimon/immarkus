import { useCallback, useEffect, useState } from 'react';
import { Bookmark, Image, ImagePlus, Loader2, Waypoints } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnnotoriousManifold, OSDViewerManifold, PluginProvider, Plugin } from '@annotorious/react-manifold';
import { mountPlugin as BooleanPlugin } from '@annotorious/plugin-boolean-operations';
import { mountOpenSeadragonPlugin as SAMPlugin } from '@annotorious/plugin-segment-anything/openseadragon';
import { LoadedImage } from '@/model';
import { useImages } from '@/store';
import { TooltipProvider } from '@/ui/Tooltip';
import { useAnnotationViewState } from './AnnotationViewState';
import { HeaderSection } from './HeaderSection';
import { RelationEditorRoot } from './RelationEditor';
import { SavingState } from './SavingState';
import { SidebarSection } from './SidebarSection';
import { SmartToolsPanel } from './SmartTools';
import { AnnotationMode, Tool } from './AnnotationMode';
import { WorkspaceSection} from './WorkspaceSection';
import { FilterState } from './FilterState';
import { GPUDisabledError } from './GPUDisabledError';

import './Annotate.css';

import '@annotorious/plugin-segment-anything/annotorious-plugin-smart-tools.css';
import { Alert, AlertDescription, AlertTitle } from '@/ui/Alert';

export const Annotate = () => {

  const params = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const { imageIds, setImageIds } = useAnnotationViewState();

  const images = useImages(imageIds) as LoadedImage[];

  const [hideAnnotations, setHideAnnotations] = useState(false);

  const [filterState, setFilterState] = useState<FilterState | undefined>();

  const [mode, setMode] = useState<AnnotationMode>('move');

  const [tool, setTool] = useState<Tool>('rectangle');

  const [isSmartPanelOpen, setIsSmartPanelOpen] = useState(false);

  const [initError, setInitError] = useState<Error | undefined>();

  // Populate context from URL on mount - but only if it's empty!
  useEffect(() => {
    const fromUrl = (params.images || '').split('&').filter(Boolean);
    if (imageIds.length === 0 && fromUrl.length > 0)
      setImageIds(fromUrl);
  }, []);

  useEffect(() => {
    if (imageIds.length === 0) return;

    const url = `/annotate/${imageIds.join('&')}`;
    if (location.pathname !== url) navigate(url, { replace: true });
  }, [imageIds]);

  const onAddImage = (imageId: string) =>
    setImageIds(ids => ([...ids, imageId]));

  const onChangeImage = (previousId: string, nextId: string) =>
    setImageIds(ids => ids.map(id => id === previousId ? nextId : id));
  
  const onCloseSmartPanel = useCallback(() => {
    setMode('move');
    setIsSmartPanelOpen(false);
  }, []);

  return (
    <div className="page annotate h-full w-full">
      <TooltipProvider>
        <AnnotoriousManifold crossAnnotatorSelect>
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
                  <main className="absolute top-0 left-0 h-full right-85 flex flex-col">
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

                    {initError ? (
                      <GPUDisabledError />
                    ) : images.length > 0 ? ( 
                      <WorkspaceSection 
                        filterState={filterState}
                        images={images} 
                        hideAnnotations={hideAnnotations}
                        mode={mode}
                        tool={tool} 
                        onAddImage={onAddImage} 
                        onChangeImages={imageIds => setImageIds(imageIds)}
                        onInitError={error => setInitError(error)}
                        onRemoveImage={image => setImageIds(ids => ids.filter(id => id !== image.id))} />
                    ) : imageIds.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground bg-muted">
                        <Alert className="bg-transparent border-none max-w-lg p-6 text-primary/60">
                          <AlertTitle className="text-lg">Your workspace is empty</AlertTitle>

                          <div className="text-sm leading-relaxed mt-4 space-y-4">
                            <p>
                              Start by opening an image from 
                              the <span className="font-semibold"><Image className="size-4 inline-block mb-0.5" strokeWidth={2.25} /> Images</span> gallery.
                              You can also send images here from 
                              the <span className="font-semibold"><Waypoints className="size-4 inline-block mb-0.5" strokeWidth={2.25} /> Knowledge Graph</span>, or
                              use the <span className="font-semibold"><ImagePlus className="size-4 inline-block mb-0.5" strokeWidth={2.25} /> Add image</span> button 
                              in the toolbar.
                            </p>
                            <p> 
                              Save and restore workspace layouts using 
                              the <span className="font-semibold"><Bookmark className="size-4 inline-block mb-0.5" strokeWidth={2.25} /> bookmark</span> tool in the toolbar.
                            </p> 
                          </div>
                        </Alert>
                      </div>
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

                  <SidebarSection 
                    filterState={filterState} 
                    onChangeFilterState={setFilterState} />
                </SavingState.Root>
              </PluginProvider>
            </RelationEditorRoot>
          </OSDViewerManifold>
        </AnnotoriousManifold>
      </TooltipProvider>
    </div>
  )

}