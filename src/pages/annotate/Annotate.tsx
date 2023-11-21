import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnnotoriousManifold } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { useImages } from '@/store';
import { HeaderSection, ToolMode, Tool } from './HeaderSection';
import { OSDViewerManifold } from './OSDViewerManifold';
import { SavingState } from './SavingState';
import { SidebarSection } from './SidebarSection';
import { WorkspaceSection} from './WorkspaceSection';

import './Annotate.css';

export const Annotate = () => {

  const navigate = useNavigate();

  const params = useParams();

  const [imageIds, setImageIds] = useState(params.images.split('&'));

  const images = useImages(imageIds, { redirect: true }) as LoadedImage[];

  const [tool, setTool] = useState<Tool>('rectangle');

  const [mode, setMode] = useState<ToolMode>('move');

  useEffect(() => {
    // Update the URL in response to image change
    navigate(`/annotate/${imageIds.join('&')}`);
  }, [imageIds]);

  return (
    <div className="page annotate h-full w-full">
      <AnnotoriousManifold>
        <OSDViewerManifold>
          {images.length > 0 && ( 
            <SavingState.Root>
              <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
                <HeaderSection
                  images={images} 
                  mode={mode}
                  tool={tool}
                  onAddImage={image => setImageIds(ids => ([...ids, image.id]))} 
                  onChangeMode={setMode}
                  onChangeTool={setTool} />

                <WorkspaceSection 
                  images={images} 
                  mode={mode}
                  tool={tool} 
                  onRemoveImage={image => setImageIds(ids => ids.filter(id => id !== image.id))} />
              </main>

              <SidebarSection />
            </SavingState.Root>
          )}
        </OSDViewerManifold>
      </AnnotoriousManifold>
    </div>
  )

}