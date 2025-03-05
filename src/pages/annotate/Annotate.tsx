import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnnotoriousManifold, OSDViewerManifold } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { useImages } from '@/store';
import { HeaderSection } from './HeaderSection';
import { RelationEditorRoot } from './RelationEditor';
import { SavingState } from './SavingState';
import { SidebarSection } from './SidebarSection';
import { SmartSelectionPanel, SmartSelectionRoot } from './SmartSelection';
import { ToolMode, Tool } from './Tool';
import { WorkspaceSection} from './WorkspaceSection';

import './Annotate.css';

export const Annotate = () => {

  const params = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const [imageIds, setImageIds] = useState(params.images.split('&'));

  const images = useImages(imageIds) as LoadedImage[];

  const [tool, setTool] = useState<Tool>('rectangle');

  const [mode, setMode] = useState<ToolMode>('move');

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
      <AnnotoriousManifold>
        <OSDViewerManifold>
          <RelationEditorRoot>
            <SmartSelectionRoot>
              <SavingState.Root>
                <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
                  <HeaderSection
                    images={images} 
                    mode={mode}
                    tool={tool}
                    onAddImage={onAddImage} 
                    onChangeImage={onChangeImage}
                    onChangeMode={setMode}
                    onChangeTool={setTool} />

                  {images.length > 0 ? ( 
                    <WorkspaceSection 
                      images={images} 
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

                  {tool === 'smart-selection' && (
                    <SmartSelectionPanel 
                      mode={mode} 
                      onChangeMode={setMode} />
                  )}
                </main>

                <SidebarSection />
              </SavingState.Root>
            </SmartSelectionRoot>
          </RelationEditorRoot>
        </OSDViewerManifold>
      </AnnotoriousManifold>
    </div>
  )

}