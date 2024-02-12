import { useEffect, useState } from 'react';
import { Image, MessagesSquare, MousePointerSquare } from 'lucide-react';
import { useSelection } from '@annotorious/react-manifold';
import * as Tabs from '@radix-ui/react-tabs';
import { Separator } from '@/ui/Separator';
import { CurrentSelection } from './CurrentSelection';
import { AnnotationList } from './AnnotationList';
import { ImageNotes } from './ImageNotes';

export const SidebarSection = () => {

  const { selected } = useSelection();

  const [tab, setTab] = useState('selection');

  useEffect(() => {
    if (selected.length > 0)
      setTab('selection');
  }, [selected]);

  return (
    <aside className="absolute top-0 right-0 h-full w-[340px] flex flex-col overflow-hidden">
      <Tabs.Root 
        asChild      
        value={tab}
        onValueChange={setTab}>
        <>
          <section className="toolbar border-b h-[46px] flex items-center flex-shrink-0">
            <Separator orientation="vertical" className="h-4" />

            <Tabs.List className="flex gap-1.5 py-0.5 px-2">
              <Tabs.Trigger value="selection" className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
                <MousePointerSquare className="h-4 w-4 mr-1" /> Selection
              </Tabs.Trigger>

              <Tabs.Trigger value="annotation-list" className="p-2 flex items-center text-xs rounded-md hover:bg-muted">
                <MessagesSquare className="h-4 w-4 mr-1" /> List
              </Tabs.Trigger>

              <Tabs.Trigger value="image-notes" className="p-2 flex items-center text-xs rounded-md hover:bg-muted text-muted-foreground">
                <Image className="h-4 w-4 mr-1" /> Image Notes
              </Tabs.Trigger>
            </Tabs.List>
          </section>

          <section className="sidebar-content bg-white flex flex-grow border-l overflow-y-auto">
            <Tabs.Content value="selection" asChild>
              <div 
                className="flex flex-grow text-sm justify-center items-center w-full p-3 px-4">
                <CurrentSelection />
              </div> 
            </Tabs.Content>

            <Tabs.Content value="annotation-list" asChild>
              <div 
                className="flex-grow text-sm justify-center items-center w-full p-3 px-4">
                <AnnotationList />
              </div> 
            </Tabs.Content>

            <Tabs.Content value="image-notes" asChild>
              <div className="flex-grow text-sm justify-center items-center w-full p-3 px-4">
                <ImageNotes />
              </div> 
            </Tabs.Content>
          </section>
        </>
      </Tabs.Root>
    </aside>
  )

}