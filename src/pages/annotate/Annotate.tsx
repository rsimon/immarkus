import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnnotoriousManifold, OSDViewerManifold } from '@annotorious/react-manifold';
import { Image, LoadedImage } from '@/model';
import { useImages } from '@/store';
import { HeaderSection } from './HeaderSection';
import { RelationEditorRoot } from './RelationEditor';
import { SavingState } from './SavingState';
import { SidebarSection } from './SidebarSection';
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

  const onAddImage = (image: Image) =>
    setImageIds(ids => ([...ids, image.id]));

  const onChangeImage = (previous: Image, next: Image) =>
    setImageIds(ids => ids.map(id => id === previous.id ? next.id : id));

  return (
    <div className="page annotate h-full w-full">
      <AnnotoriousManifold>
        <OSDViewerManifold>
          <RelationEditorRoot>
            {images.length > 0 && ( 
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

                  <WorkspaceSection 
                    images={images} 
                    mode={mode}
                    tool={tool} 
                    onAddImage={onAddImage} 
                    onChangeImages={images => setImageIds(images.map(i => i.id))}
                    onRemoveImage={image => setImageIds(ids => ids.filter(id => id !== image.id))} />
                </main>

                <SidebarSection />
              </SavingState.Root>
            )}
          </RelationEditorRoot>
        </OSDViewerManifold>
      </AnnotoriousManifold>
    </div>
  )

}