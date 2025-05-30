import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import { Button } from '@/ui/Button';
import { NODE_COLORS, LINK_COLORS } from '../Styles';
import { useKnowledgeGraphSettings } from '../KnowledgeGraphState';

export const Legend = () => {

  const { settings, setSettings } = useKnowledgeGraphSettings();

  const expanded = settings.legendExpanded;

  const edgeLegendEl = useRef<HTMLDivElement>(null);

  const [edgeLegendHeight, setEdgeLegendHeight] = useState(0);

  // Don't animate the initial render
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (expanded && edgeLegendEl.current)
      setEdgeLegendHeight(edgeLegendEl.current.scrollHeight);      
  }, [expanded, settings.graphMode, settings.includeFolders]);

  useEffect(() => {
    // If initial state is collapsed, set edgeLegend to display: none.
    if (!expanded)
      edgeLegendEl.current.style.display = 'none';

    setTimeout(() => setIsFirstRender(false), 10);
  }, []);

  const containerBase =
    'group border border-white absolute bottom-4 left-4 max-w-[400px] text-sm bg-white/70 backdrop-blur-xs hover:border-inherit';

  const containerClass = expanded 
    ? containerBase + ' rounded-lg p-3.5'
    : containerBase + ' rounded-full p-4 pr-14';

  const toggleBase =
    'rounded-full absolute right-1.5 text-muted-foreground hidden group-hover:flex';

  const toggleClass = expanded ? toggleBase + ' top-1.5': toggleBase + ' top-0 my-auto bottom-0';

  const edgeLegendSpring = useSpring({
    height: expanded ? edgeLegendHeight || 'auto' : 0,
    opacity: expanded ? 1 : 0,
    immediate: isFirstRender,
    config: { tension: 500, friction: expanded ? 28 : 40 },
    onRest: () => {
      if (!expanded) edgeLegendEl.current.style.display = 'none';
    }
  });

  const onToggle = () => {
    edgeLegendEl.current.style.display = 'block';
    setSettings(settings => ({
      ...settings,
      legendExpanded: !settings.legendExpanded
    }));
  }

  return (
    <div className={containerClass}>
      <Button 
        size="icon" 
        variant="ghost" 
        className={toggleClass}
        onClick={onToggle}>
        {expanded ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>

      <div>
        {expanded && (<h3 className="font-medium pb-1.5">Nodes</h3>)}

        <ul className="flex gap-6 text-muted-foreground text-xs">
          <li className="flex gap-2 items-center">
            <span 
              style={{ backgroundColor: NODE_COLORS['ENTITY_TYPE']}} 
              className="block w-[12px] h-[12px] rounded-full" />
            <span>Entity Class</span>
          </li>

          {settings.includeFolders && (
            <li className="flex gap-2 items-center">
              <span 
                style={{ backgroundColor: NODE_COLORS['FOLDER']}} 
                className="block w-[12px] h-[12px] rounded-full" />
              <span>Sub-Folder</span>
            </li>
          )}

          <li className="flex gap-2 items-center">
            <span 
              style={{ backgroundColor: NODE_COLORS['IMAGE']}} 
              className="block w-[12px] h-[12px] rounded-full"/>
            <span>Image</span>
          </li>
        </ul>
      </div>

      <animated.div style={edgeLegendSpring}>
        <div ref={edgeLegendEl}>
          <div className="pt-8">
            <h3 className="font-medium py-0.5">Edges</h3>
            <ul>
              {settings.graphMode === 'RELATIONS' && (
                <li className="flex gap-3 items-start py-2">
                  <div 
                    className="mt-2 h-0 w-14 shrink-0 border-t-2 border-black" 
                    style={{ borderColor: LINK_COLORS.HAS_RELATED_ANNOTATION_IN }} />

                  <div>
                    <h4 className="font-medium">
                      Relationship
                    </h4>

                    <p className="text-muted-foreground text-xs">
                      Connections based on Relationships between your annotations.
                    </p>
                  </div>
                </li>
              )}

              <li className="flex gap-3 items-start py-2">
                <div 
                  className="mt-2 h-0 w-14 shrink-0 border-t-2 border-black border-dashed" 
                  style={{ borderColor: LINK_COLORS.IS_PARENT_TYPE_OF }} />

                <div>
                  <h4 className="font-medium">
                    Entity class hierarchy
                  </h4>

                  <p className="text-muted-foreground text-xs">
                    Links between parent- and child Entity Classes in your data model.
                  </p>
                </div>
              </li>

              {settings.includeFolders && (
                <li className="flex gap-3 items-start py-2">
                  <div 
                    className="mt-2 h-0 w-14 shrink-0 border-t-2 border-black border-dashed" 
                    style={{ borderColor: LINK_COLORS.FOLDER_CONTAINS_SUBFOLDER }} />

                  <div>
                    <h4 className="font-medium">Folder structure</h4>
                    <p className="text-muted-foreground text-xs">
                      File structure of sub-folders and image files in your 
                      project directory.
                    </p>
                  </div>
                </li>
              )}

              <li className="flex gap-3 items-start py-2">
                <div 
                  className="mt-2 h-0 w-14 shrink-0 border-t-4 border-black" 
                  style={{ borderColor: LINK_COLORS.HAS_ENTITY_ANNOTATION }} />

                <div>
                  <h4 className="font-medium">Entity Annotations</h4>
                  <p className="text-muted-foreground text-xs">
                    Connections between images and Entity Classes, based on 
                    the tags in your annotations.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </animated.div>
    </div>
  )

}