import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnnotoriousManifold, useViewers } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { useStore } from '@/store';
import { Separator } from '@/ui/Separator';
import { isSingleImageManifest } from '@/utils/iiif';
import { PaginationWidget } from '../Pagination';
import { SavingState } from '../SavingState';
import { AnnotationMode, Tool } from '../AnnotationMode';
import { ToolbarButton } from '../ToolbarButton';
import { AddImage } from './AddImage';
import { CopyToClipboard } from './CopyToClipboard';
import { ToolSelector } from './ToolSelector';
import { MoreToolsPanel } from './MoreToolsPanel';
import { RelationEditor } from '../RelationEditor';
import { SmartToolsButton } from './SmartToolsButton';
import { useCollapsibleToolbar } from './useCollapsibleToolbar';
import { 
  ChevronLeft, 
  MousePointer2, 
  Redo2, 
  RotateCcwSquare, 
  RotateCwSquare, 
  Spline, 
  Undo2, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';

const ENABLE_CONNECTOR_PLUGIN = import.meta.env.VITE_ENABLE_CONNECTOR_PLUGIN === 'true';

interface HeaderSectionProps {

  images: LoadedImage[];

  isSmartPanelOpen: boolean;

  onToggleSmartPanel(): void;

  mode?: AnnotationMode;

  tool: Tool;

  onAddImage(imageId: string): void;

  onChangeImage(previousId: string, nextId: string): void;

  onChangeTool(tool: Tool): void;

  onChangeMode(mode?: AnnotationMode): void;

}

export const HeaderSection = (props: HeaderSectionProps) => {

  const viewers = useViewers();

  const manifold = useAnnotoriousManifold();

  const store = useStore();

  const osdToolsDisabled = props.images.length === 0 || props.images.length > 1;

  const [relationsEditorOpen, setRelationsEditorOpen] = useState(false);

  /** 
   * The toolbar has a 'collapsed mode', GDocs-style, 
   * which we'll enable as soon as it overflows.
   */
  const { ref, collapsed } = useCollapsibleToolbar();

  const onEnableDrawing = (tool?: Tool) => {
    if (tool)
      props.onChangeTool(tool);

    props.onChangeMode('draw');

    if (relationsEditorOpen)
      setRelationsEditorOpen(false);
  }

  const onRotate = (clockwise: boolean) => {
    const viewer = Array.from(viewers.values())[0];
    // @ts-ignore
    viewer.viewport.rotateBy(clockwise ? 90 : -90);
  }

  const onZoom = (factor: number) => () => {
    const viewer = Array.from(viewers.values())[0];
    viewer.viewport.zoomBy(factor);
  }

  const onUndo = () => {
    const anno = manifold.getAnnotator(props.images[0].id);
    anno.undo();
  }

  const onRedo = () => {
    const anno = manifold.getAnnotator(props.images[0].id);
    anno.redo();
  }

  const back = useMemo(() => {
    // Just return to gallery root if there are multiple images open
    if (props.images.length === 0 || props.images.length > 1) return '/images/';

    const source = props.images[0];
    if ('manifestId' in source) {
      const manifest = store.getIIIFResource(source.manifestId);
      if (isSingleImageManifest(manifest)) {
        const folder = store.getFolder(manifest.folder);
        return `/images/${folder && ('id' in folder) ? folder.id : ''}`;
      } else {
        return `/images/${source.manifestId}`;
      }
    }

    // Return to parent folder (might be root)
    const folder = store.getFolder(source.folder);
    return `/images/${folder && ('id' in folder) ? folder.id : ''}`;
  }, [props.images]);

  const onRelationsEditorOpenChange = (open: boolean) => {
    if (open) {
      props.onChangeMode('relation');
    } else {
      props.onChangeMode('move');
    }
  }

  useEffect(() => {
    setRelationsEditorOpen(props.mode === 'relation');
  }, [props.mode]);

  useEffect(() => {
    // If collapsed state changes, this will force-unmount the RelationEditor...
    props.onChangeMode('move');
  }, [collapsed]);

  return (
    <section 
      ref={ref}
      className="toolbar relative border-b p-2 flex text-sm h-[46px]">
      <section className="toolbar-left flex gap-1 basis-24 shrink-0 grow-1 items-center overflow-hidden">
        <div className="flex items-center overflow-hidden">
          <Link className="font-semibold inline shrink-0" to={back}>
            <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </Link>

          <span className="text-xs font-medium ml-0.5 flex-1 min-w-0 truncate">
            {props.images.length === 1 ? props.images[0].name : 'Back to Gallery'}
          </span>
        </div>

        <SavingState.Indicator />
      </section>

      <section className="toolbar-right flex gap-1 items-center grow-2 justify-end">
        {collapsed && (
          <>
            <MoreToolsPanel 
              images={props.images}
              mode={props.mode}
              relationsEditorOpen={relationsEditorOpen}
              osdToolsDisabled={osdToolsDisabled}
              onAddImage={props.onAddImage}
              onChangeImage={props.onChangeImage} 
              onChangeMode={props.onChangeMode}
              onRelationsEditorOpenChange={onRelationsEditorOpenChange}
              onRedo={onRedo}
              onRotate={onRotate}
              onUndo={onUndo} />

            <Separator orientation="vertical" className="h-4" />
          </>
        )}

        {!collapsed && (
          <>
            {props.images.length > 0 && (
              <>
                <AddImage 
                  current={props.images} 
                  onAddImage={props.onAddImage} />

                <Separator orientation="vertical" className="h-4" />

                <PaginationWidget 
                  disabled={osdToolsDisabled}
                  image={props.images[0]} 
                  onChangeImage={props.onChangeImage} 
                  onAddImage={props.onAddImage} />

                <Separator orientation="vertical" className="h-4" />
              </>
            )}

            <ToolbarButton
              disabled={osdToolsDisabled}
              onClick={() => onRotate(false)}
              tooltip="Rotate image counterclockwise">
              <RotateCcwSquare
                className="h-8 w-8 p-2" />
            </ToolbarButton>

            <ToolbarButton
              disabled={osdToolsDisabled}
              onClick={() => onRotate(true)}
              tooltip="Rotate image clockwise">
              <RotateCwSquare 
                className="h-8 w-8 p-2" />
            </ToolbarButton>
          </>
        )}

        <ToolbarButton 
          disabled={osdToolsDisabled}
          onClick={onZoom(2)}
          tooltip="Zoom in">
          <ZoomIn 
            className="h-8 w-8 p-2" />
        </ToolbarButton>

        <ToolbarButton 
          disabled={osdToolsDisabled}
          onClick={onZoom(0.5)}
          tooltip="Zoom out">
          <ZoomOut 
            className="h-8 w-8 p-2" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-4" />

        {!collapsed && (
          <>
            <ToolbarButton
              disabled={osdToolsDisabled}
              onClick={onUndo}
              tooltip="Undo">
              <Undo2 
                className="h-8 w-8 p-2" />
            </ToolbarButton>

            <ToolbarButton
              disabled={osdToolsDisabled}
              onClick={onRedo}
              tooltip="Redo">
              <Redo2
                className="h-8 w-8 p-2" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-4" />
          </>
        )}

        <button 
          className="p-1.5 pr-2.5 flex items-center text-xs rounded-md hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-selected={props.mode === 'move'}
          data-state={props.mode === 'move' ? 'active' : undefined}
          onClick={() => props.onChangeMode('move')}>
          <MousePointer2 className="size-4 mr-1" /> Move
        </button>

        <ToolSelector 
          tool={props.tool} 
          mode={props.mode}
          onToolChange={onEnableDrawing} />

        <Separator orientation="vertical" className="h-4" />

        {!collapsed && (
          <>
            <CopyToClipboard 
              images={props.images} />

            {ENABLE_CONNECTOR_PLUGIN ? (
              <button 
                className="pr-2.5 flex items-center text-xs rounded-md hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-selected={props.mode === 'relation'}
                data-state={props.mode === 'relation'}
                onClick={() => props.onChangeMode('relation')}>
                <Spline
                  className="h-8 w-8 p-2" /> Connect
              </button>
            ) : (
              <RelationEditor 
                open={relationsEditorOpen}
                onOpenChange={onRelationsEditorOpenChange}/>
            )}
          </>
        )}
        
        <SmartToolsButton 
          isSmartPanelOpen={props.isSmartPanelOpen}
          onClick={props.onToggleSmartPanel} />
      </section>
    </section>
  )

}