import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnnotoriousManifold } from '@annotorious/react-manifold';
import { useStore } from '@/store';
import { HeaderSection, ToolMode, Tool } from './HeaderSection';
import { SidebarSection } from './SidebarSection';
import { WorkspaceSection} from './WorkspaceSection';

import './Annotate.css';
import { OSDViewerManifold } from './OSDViewerManifold';

export const Annotate = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  const images = params.images.split('&').map(id => store?.getImage(id)).filter(Boolean);

  const [tool, setTool] = useState<Tool>('rectangle');

  const [mode, setMode] = useState<ToolMode>('move');
  
  const onSaving = () => {
    // TODO
  }

  const onSaved = () => {
    // TODO
  }

  const onSaveError = () => {
    // TODO
  }

  return (
    <div className="page annotate h-full w-full">
      <AnnotoriousManifold>
        <OSDViewerManifold>
          <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
            <HeaderSection
              images={images} 
              mode={mode}
              tool={tool}
              onChangeMode={setMode}
              onChangeTool={setTool} />

            <WorkspaceSection 
              images={images} 
              mode={mode}
              tool={tool}
              onSaving={onSaving} 
              onSaved={onSaved}
              onSaveError={onSaveError} />
          </main>

          <SidebarSection />
        </OSDViewerManifold>
      </AnnotoriousManifold>
    </div>
  )

}