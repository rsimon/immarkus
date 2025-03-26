import { useEffect, useState } from 'react';
import { Minus, TriangleAlert, WandSparkles } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';
import { Spinner } from '@/components/Spinner';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';
import { PluginManifoldProxy } from 'node_modules/@annotorious/react-manifold/dist/plugins/PluginManifoldInstance';

interface ClickAndRefinePanelProps {

  plugin: PluginManifoldProxy<ReturnType<typeof mountOpenSeadragonPlugin>>;
  
  busy: boolean;

  enabled: boolean;

  onSetEnabled(enabled: boolean): void;

}

export const ClickAndRefineSection = (props: ClickAndRefinePanelProps) => {

  const { busy, enabled, plugin } = props;

  const anno = useAnnotoriousManifold();

  const [mode, setMode] = useState<'add' | 'remove' | ''>('add');

  const [currentAnnotationId, setCurrentAnnotationId] = useState<string | undefined>();

  useEffect(() => {
    if (!plugin?.on) return;

    const onCreate = (a: ImageAnnotation) => setCurrentAnnotationId(a.id);
    const onDelete = () => setCurrentAnnotationId(undefined);

    const removeCreateHandlers = plugin.on('createAnnotation', onCreate);
    const removeDeleteHandlers = plugin.on('deleteAnnotation', onDelete);

    return () => {
      removeCreateHandlers.forEach(fn => fn());
      removeDeleteHandlers.forEach(fn => fn());
    }
  }, [plugin]);

  useEffect(() => { 
    setMode(m => enabled ? m || 'add' : '');

    if (!plugin?.start || !plugin?.stop) return;

    if (enabled)
      plugin.start();
    else
      plugin.stop();
  }, [plugin, enabled]);

  useEffect(() => {
    if (!plugin?.setQueryMode || !plugin.restart) return;

    if (mode) {
      plugin.setQueryMode(mode);
    } else if (enabled) {
      plugin.restart();
    }
  }, [mode, plugin, enabled]);

  const onChangeMode = (m: string) => {
    setMode((m || '') as 'add' | 'remove' | '');
    props.onSetEnabled(Boolean(m));
  }

  const onConfirm = () => {
    setMode('add');
    anno.setSelected(currentAnnotationId, true);

    if (plugin?.restart)
      plugin.restart();
  }

  const onReset = () => {
    setMode('add');

    if (plugin.reset)
      plugin.reset();
  }

  return (
    <div className="px-4">
      <div className="border border-orange-300 bg-orange-100 text-orange-400 mt-3 p-1.5 flex justify-center rounded">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-3.5 mb-[1px]" /> Beta
        </div>
      </div>
      <p className="pt-3 pb-2 font-light leading-relaxed">
        Hover over the image to preview selection. Click to confirm. Add or remove points to refine.
      </p>

      <ToggleGroup
        type="single"
        value={mode}
        className="flex pt-6 justify-around"
        onValueChange={onChangeMode}>
        <div className="flex flex-col items-center gap-1">
          <ToggleGroupItem 
            value="add"
            className="!rounded-md aspect-square h-12 hover:border-orange-400/70 hover:[&+*]:text-orange-400 border border-orange-500/25 text-orange-400/25 hover:text-orange-400/70 data-[state=on]:bg-orange-400 data-[state=on]:border-orange-400 data-[state=on]:[&+*]:text-orange-400">
            {busy ? (
              <Spinner />
            ) : (
              <WandSparkles className="size-5" />
            )}
          </ToggleGroupItem>
          <span className="pt-1 text-orange-600/40">Select object</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <ToggleGroupItem 
            value="remove"
            className="!rounded-md aspect-square h-12 hover:border-orange-400/70 hover:[&+*]:text-orange-400 border border-orange-500/25 text-orange-400/25 hover:text-orange-400/70 data-[state=on]:bg-orange-400 data-[state=on]:border-orange-400 data-[state=on]:[&+*]:text-orange-400">
            <Minus className="size-5"/>
          </ToggleGroupItem>
          <span className="pt-1 text-orange-600/40">Remove area</span>
        </div>
      </ToggleGroup>

      <div className="flex justify-around pt-8 pb-4">
        <div className="text-white flex">
          <button
            disabled={!enabled || !currentAnnotationId}
            onClick={onConfirm}
            className="px-8 rounded-l-md border border-r-0 border-orange-400 py-1.5 bg-orange-400 hover:bg-orange-400/90 disabled:border-orange-300/5 disabled:bg-orange-500/25">
            Done
          </button>

          <button 
            disabled={!enabled || !currentAnnotationId}
            onClick={onReset}
            className="px-8 rounded-r-md py-1.5 bg-transparent text-orange-500 border border-l-0 border-orange-400 hover:bg-orange-500/10 disabled:bg-orange-500/25 disabled:border-orange-300/5 disabled:text-white">
            Reset
          </button>
        </div>
      </div>
    </div>
  )

}