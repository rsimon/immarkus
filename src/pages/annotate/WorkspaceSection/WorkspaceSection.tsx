import { useEffect, useRef, useState } from 'react';
import { Mosaic, MosaicNode, createBalancedTreeFromLeaves } from 'react-mosaic-component';
import { v4 as uuidv4 } from 'uuid';
import { Image, LoadedImage } from '@/model';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../Tool';
import { WorkspaceWindow } from './WorkspaceWindow';

import 'react-mosaic-component/react-mosaic-component.css';

interface WorkspaceSectionProps {

  images: LoadedImage[];

  mode: ToolMode;

  tool: Tool;

  onAddImage(image: Image): void;

  onChangeImages(images: Image[]): void;

  onRemoveImage(image: Image): void;

}

export const WorkspaceSection = (props: WorkspaceSectionProps) => {

  // Association between image ID and Mosaic window ID
  const windowMap = useRef<{ windowId: string, image: LoadedImage }[]>([]);

  // Mosaic state
  const [value, setValue] = useState<MosaicNode<string>>();
  
  useEffect(() => {
    if (props.images.length > 1) {
      const diff = props.images.length - windowMap.current.length;

      const next = (diff === 0) 
        // Same length - replace
        ? windowMap.current.map(({ windowId }, idx) => ({ windowId, image: props.images[idx] }))
        : diff > 0
          // More images
          ? [
              ...windowMap.current.map(({ windowId }, idx) => ({ windowId, image: props.images[idx] })),
              ...props.images.slice(-diff).map(image => ({ windowId: uuidv4(), image: image }))
            ]
          // Fewer images
          : windowMap.current.slice(0, props.images.length)
              .map(({ windowId}, idx) => ({ windowId, image: props.images[idx] }));

      windowMap.current = next;

      setValue(createBalancedTreeFromLeaves(next.map(t => t.windowId)));
    }
  }, [props.images]);

  const onChangeImage = (windowId: string, nextImage: Image) => {
    const nextImages = windowMap.current
      .map(entry => entry.windowId === windowId ? nextImage : entry.image);

    props.onChangeImages(nextImages);
  }

  const onClose = (windowId: string) => {
    const nextImages = windowMap.current
      .filter(entry => entry.windowId !== windowId)
      .map(entry => entry.image);

    props.onChangeImages(nextImages);
  }
  
  return (
    <section className="workspace flex-grow bg-muted">
      {props.images.length === 1 ? (
        <AnnotatableImage 
          image={props.images[0]} 
          mode={props.mode}
          tool={props.tool} />
      ) : props.images.length > 1 && (
        <Mosaic<string>
          renderTile={(windowId, path) => (
            <WorkspaceWindow 
              windowId={windowId} 
              windowPath={path} 
              image={windowMap.current.find(t => t.windowId === windowId)?.image}
              mode={props.mode}
              tool={props.tool}
              onAddImage={props.onAddImage}
              onChangeImage={(_, next) => onChangeImage(windowId, next)} 
              onClose={() => onClose(windowId)} />
          )}
          value={value}
          onChange={setValue}
        />
      )}
    </section>
  )

}