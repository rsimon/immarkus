import { Image, LoadedImage } from '@/model';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../HeaderSection';
import { WorkspaceWindow } from './WorkspaceWindow';

import 'react-mosaic-component/react-mosaic-component.css';

interface WorkspaceSectionProps {

  images: LoadedImage[];

  mode: ToolMode;

  tool: Tool;

  onRemoveImage(image: Image): void;

}

export const WorkspaceSection = (props: WorkspaceSectionProps) => {
  
  return (
    <section className="workspace flex-grow bg-muted">
      {props.images.length === 1 ? (
        <AnnotatableImage 
          image={props.images[0]} 
          mode={props.mode}
          tool={props.tool} />
      ) : props.images.length > 1 ? (
        <WorkspaceWindow {...props} />
      ) : undefined}
    </section>
  )

}