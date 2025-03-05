import { useEffect, useState } from 'react';
import { Minus, WandSparkles } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';
import { useSAMPlugin } from '../../SmartSelectionRoot';
import { SAM2DecoderPrompt } from '@annotorious/plugin-segment-anything/openseadragon';

interface ClickAndRefinePanelProps {

  enabled: boolean;

  onSetEnabled(enabled: boolean): void;

}

export const ClickAndRefineSection = (props: ClickAndRefinePanelProps) => {

  const { enabled } = props;

  const { samPlugin, samPluginBusy } = useSAMPlugin();

  const [mode, setMode] = useState<'add' | 'remove' | ''>('add');

  const [hasPrompt ,setHasPrompt] = useState(false);

  useEffect(() => {
    if (!samPlugin) return;

    const onPromptChanged = (prompt?: SAM2DecoderPrompt) =>
       setHasPrompt(Boolean(prompt));

    const unsubscribe = samPlugin.on('promptChanged', onPromptChanged);

    return () => {
      unsubscribe();
    }
  }, [samPlugin]);

  useEffect(() => { 
    setMode(m => enabled ? m || 'add' : '');

    if (!samPlugin) return;

    try {
      if (enabled) {
        console.log('starting');
        samPlugin.start();
      } else {
        samPlugin.stop();
      }
    } catch (error) {
      console.error(error);
    }

    return () => {
      samPlugin?.stop();
    }
  }, [samPlugin, enabled]);

  useEffect(() => {
    if (!samPlugin) return;

    if (mode) {
      samPlugin.setQueryMode(mode);
    } else if (enabled) {
      samPlugin.restart();
    }
  }, [mode, samPlugin, enabled]);

  const onChangeMode = (m: string) => {
    setMode((m || '') as 'add' | 'remove' | '');
    props.onSetEnabled(Boolean(m));
  }

  const onConfirm = () => {
    setMode('add');
    samPlugin?.restart();
  }

  const onReset = () => {
    setMode('add');
    samPlugin?.reset();
  }

  return (
    <div className="px-6">
      <p className="pt-4 pb-2 font-light text-fuchsia-900">
        Click to select an object. Add points to expand or remove areas.
      </p>

      <ToggleGroup
        type="single"
        value={mode}
        className="flex pt-6 justify-around"
        onValueChange={onChangeMode}>
        <div className="flex flex-col items-center gap-1">
          <ToggleGroupItem 
            value="add"
            className="!rounded-md aspect-square h-12 hover:border-fuchsia-800/70 hover:[&+*]:text-fuchsia-800 border border-fuchsia-900/25 text-fuchsia-900/25 hover:text-fuchsia-800 data-[state=on]:bg-fuchsia-800 data-[state=on]:border-fuchsia-800 data-[state=on]:[&+*]:text-fuchsia-800">
            {samPluginBusy ? (
              <Spinner />
            ) : (
              <WandSparkles className="size-5" />
            )}
          </ToggleGroupItem>
          <span className="pt-1 text-fuchsia-900/40">Select object</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <ToggleGroupItem 
            value="remove"
            className="!rounded-md aspect-square h-12 hover:border-fuchsia-800/70 hover:[&+*]:text-fuchsia-800 border border-fuchsia-900/25 text-fuchsia-900/25 hover:text-fuchsia-800 data-[state=on]:bg-fuchsia-800 data-[state=on]:border-fuchsia-800 data-[state=on]:[&+*]:text-fuchsia-800">
            <Minus className="size-5"/>
          </ToggleGroupItem>
          <span className="pt-1 text-fuchsia-900/40">Remove area</span>
        </div>
      </ToggleGroup>

      <div className="flex justify-around pt-7 pb-3">
        <div className="text-white flex">
          <button
            disabled={!enabled || !hasPrompt}
            onClick={onConfirm}
            className="px-8 rounded-l-md border-r border-indigo-50/70 py-1.5 bg-fuchsia-800 hover:bg-fuchsia-900 disabled:bg-fuchsia-900/25">
            Done
          </button>

          <button 
            disabled={!enabled || !hasPrompt}
            onClick={onReset}
            className="px-8 rounded-r-md py-1.5 bg-fuchsia-800 hover:bg-fuchsia-900 disabled:bg-fuchsia-900/25">
            Reset
          </button>
        </div>
      </div>
    </div>
  )

}