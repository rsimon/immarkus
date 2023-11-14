import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnnotoriousManifold } from '@annotorious/react-manifold';
import { useStore } from '@/store';
import { HeaderSection, ToolMode, Tool } from './HeaderSection';
import { OSDViewerManifold } from './OSDViewerManifold';
import { SavingState } from './SavingState';
import { SidebarSection } from './SidebarSection';
import { WorkspaceSection} from './WorkspaceSection';

import './Annotate.css';

export const Annotate = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  const images = params.images.split('&').map(id => store?.getImage(id)).filter(Boolean);

  const [tool, setTool] = useState<Tool>('rectangle');

  const [mode, setMode] = useState<ToolMode>('move');

  return (
    <div className="page annotate h-full w-full">
      <AnnotoriousManifold>
        <OSDViewerManifold>
          <SavingState.Root>
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
                tool={tool} />
            </main>

            <SidebarSection />
          </SavingState.Root>
        </OSDViewerManifold>
      </AnnotoriousManifold>
    </div>
  )

}