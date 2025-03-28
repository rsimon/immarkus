import { useEffect } from 'react';
import { PluginManifoldProxy } from '@annotorious/react-manifold';
import { mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';
import { Spinner } from '@/components/Spinner';

interface SAMInitializingProps {

  downloading: boolean;

  plugin: PluginManifoldProxy<ReturnType<typeof mountOpenSeadragonPlugin>>;

  progress: number;

}

export const SAMInitializing = (props: SAMInitializingProps) => {

  const { plugin, downloading, progress } = props;

  useEffect(() => {
    if (!plugin) return;
    plugin.init();
  }, [plugin]);

  return (
    <div>
      {downloading ? (
        <div className="min-h-36 flex flex-col items-center p-4 space-y-4 relative">
          <div>Downloading AI model</div>

          <div className="w-full bg-stone-200 rounded-full h-0.5">
            <div 
              className="bg-orange-400 h-0.5 rounded-full" 
              style={{ width: `${Math.round(progress * 100)}%` }}
            ></div>
          </div>

          <div className="text-muted-foreground text-center leading-relaxed">
            This may take a while. The model will remain stored in your browser
            for future uses.
          </div>
        </div>
      ) : (
        <div className="h-36 flex justify-center items-center">
          <Spinner className="h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  )

}