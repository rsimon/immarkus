import { useParams } from 'react-router-dom';
import { AnnotoriousManifold } from '@annotorious/react-manifold';
import { useStore } from '@/store';
import { HeaderSection } from './HeaderSection';
import { SidebarSection } from './SidebarSection';
import { WorkspaceSection} from './WorkspaceSection';

import './Annotate.css';

export const Annotate = () => {

  const store = useStore({ redirect: true });

  const params = useParams();

  const images = params.images.split('&').map(id => store?.getImage(id)).filter(Boolean);
  
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
        <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
          <HeaderSection
            images={images} />

          <WorkspaceSection 
            images={images} 
            onSaving={onSaving} 
            onSaved={onSaved}
            onSaveError={onSaveError} />
        </main>

        <SidebarSection />
      </AnnotoriousManifold>
    </div>
  )

}