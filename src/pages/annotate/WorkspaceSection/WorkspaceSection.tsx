import { useEffect, useState } from 'react';
import { Mosaic } from 'react-mosaic-component';
import { Image, LoadedImage } from '@/model';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../HeaderSection';
import { WorkspaceWindow } from './WorkspaceWindow';
import { v4 as uuidv4 } from 'uuid';

import 'react-mosaic-component/react-mosaic-component.css';

interface WorkspaceSectionProps {

  images: LoadedImage[];

  mode: ToolMode;

  tool: Tool;

  onChangeImage(previous: Image, next: Image): void;

  onRemoveImage(image: Image): void;

}

const createInitialValue= (list: string[], direction = 'row') => {
  const [first, ...rest] = list;
  return {
    direction,
    first,
    second: rest.length === 1 ? rest[0] : createInitialValue(rest, direction === 'row' ? 'column' : 'row')
  };
}

export const WorkspaceSection = (props: WorkspaceSectionProps) => {

  const [windowMap, setWindowMap] = useState<{ windowId: string, image: LoadedImage }[]>([]);

  useEffect(() => {
    setWindowMap(entries => {
      const diff = props.images.length - entries.length;

      if (diff === 0) {
        return entries.map(({ windowId }, idx) => ({ windowId, image: props.images[idx] }));
      } else if (diff > 0) {
        // More images
        return [
          ...entries.map(({ windowId }, idx) => ({ windowId, image: props.images[idx] })),
          ...props.images.slice(-diff).map(image => ({ windowId: uuidv4(), image: image }))
        ];
      } else {
        // Fewer images
        return entries.slice(0, props.images.length)
          .map(({ windowId}, idx) => ({ windowId, image: props.images[idx] }));
      }
    });
  }, [props.images]);
  
  return (
    <section className="workspace flex-grow bg-muted">
      {windowMap.length === 1 ? (
        <AnnotatableImage 
          image={windowMap[0].image} 
          mode={props.mode}
          tool={props.tool} />
      ) : windowMap.length > 1 ? (
        <Mosaic
          renderTile={(windowId, path) => (
            <WorkspaceWindow 
              windowId={windowId} 
              windowPath={path} 
              image={windowMap.find(t => t.windowId === windowId)!.image}
              onChangeImage={props.onChangeImage}
              {...props} />
          )} 
          initialValue={createInitialValue(windowMap.map(({ windowId }) => windowId))} />
      ) : undefined}
    </section>
  )

}