import { useCallback, useEffect, useRef, useState } from 'react';
import { Mosaic, MosaicBranch, MosaicNode, createBalancedTreeFromLeaves } from 'react-mosaic-component';
import { v4 as uuidv4 } from 'uuid';
import { Image, LoadedImage } from '@/model';
import { useWindowSize } from '@/utils/useWindowSize';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../Tool';
import { WorkspaceWindow, WorkspaceWindowRef } from './WorkspaceWindow';
import { usePersistentHistory } from './usePersistentHistory';

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

  const windowRefs = useRef<Map<string, WorkspaceWindowRef>>();

  // Image undo histories 
  const { onUnmountAnnotator, getPersistedHistory } = usePersistentHistory(props.images);

  // Mosaic state
  const [value, setValue] = useState<MosaicNode<string>>();

  // Track window size, so we can update window toolbars responsively
  const { width } = useWindowSize();
  
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
    } else {
      windowRefs.current === undefined;
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

  const onChange = (value: MosaicNode<string>) => {
    setValue(value);
    windowRefs.current?.forEach(ref => ref?.onResize());
  }

  const trackRef = (windowId: string) => (ref: WorkspaceWindowRef) => {
    if (!windowRefs.current)
      windowRefs.current = new Map<string, WorkspaceWindowRef>();

    if (ref)
      windowRefs.current.set(windowId, ref);
    else
      windowRefs.current.delete(windowId);
  }

  useEffect(() => {
    windowRefs.current?.forEach(ref => ref?.onResize());
  }, [width]);

  const renderWindow = useCallback((windowId: string, path: MosaicBranch[]) => {
    const image = windowMap.current.find(t => t.windowId === windowId)?.image;

    return (
      <WorkspaceWindow 
        ref={trackRef(windowId)}
        windowId={windowId} 
        windowPath={path} 
        image={image}
        initialHistory={getPersistedHistory(image.id)}
        mode={props.mode}
        tool={props.tool}
        onAddImage={props.onAddImage}
        onChangeImage={(_, next) => onChangeImage(windowId, next)} 
        onClose={() => onClose(windowId)} 
        onUnmount={onUnmountAnnotator(image.id)} />
    )
  }, []);
  
  return (
    <section className="workspace flex-grow bg-muted">
      {props.images.length === 1 ? (
        <AnnotatableImage
          initialHistory={getPersistedHistory(props.images[0].id)}
          image={props.images[0]}
          mode={props.mode}
          tool={props.tool} 
          onUnmount={onUnmountAnnotator(props.images[0].id)} />
      ) : props.images.length > 1 && (
        <Mosaic<string>
          renderTile={renderWindow}
          value={value}
          onChange={onChange}
        />
      )}
    </section>
  )

}