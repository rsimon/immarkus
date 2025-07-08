import { useState } from 'react';
import { Image, MessagesSquare, SquareMousePointer } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { Separator } from '@/ui/Separator';
import { CurrentSelection } from './CurrentSelection';
import { AnnotationList } from './AnnotationList';
import { ImageMetadata } from './ImageMetadata';

export const SidebarSection = () => {

  const [tab, setTab] = useState('selection');

  const onEdit = () => setTab('selection');

  return (
    <Tabs.Root 
      asChild      
      value={tab}
      onValueChange={setTab}>
      <aside id="sidebar-section" className="absolute top-0 right-0 h-full w-[340px] flex flex-col overflow-hidden">
        <section className="toolbar border-b h-[46px] flex items-center shrink-0">
          <Separator orientation="vertical" className="h-4" />

          <Tabs.List className="flex gap-1.5 py-0.5 px-3">
            <Tabs.Trigger value="selection" className="p-1.5 flex items-center text-xs rounded-md hover:bg-muted">
              <SquareMousePointer className="h-4 w-4 mr-1" /> Selection
            </Tabs.Trigger>

            <Tabs.Trigger value="annotation-list" className="p-1.5 flex items-center text-xs rounded-md hover:bg-muted">
              <MessagesSquare className="h-4 w-4 mr-1" /> List
            </Tabs.Trigger>

            <Tabs.Trigger value="image-notes" className="p-1.5 flex items-center text-xs rounded-md hover:bg-muted text-muted-foreground">
              <Image className="h-4 w-4 mr-1" /> Metadata
            </Tabs.Trigger>
          </Tabs.List>
        </section>

        <section 
          className="sidebar-content flex grow border-l overflow-y-auto">
          <Tabs.Content value="selection" asChild>
            <div 
              className="flex grow h-full text-sm justify-center items-center w-full pt-1 pb-3 px-4">
              <CurrentSelection />
            </div> 
          </Tabs.Content>

          <Tabs.Content value="annotation-list" asChild>
            <div 
              className="grow h-full text-sm justify-center items-center w-full">
              <AnnotationList 
                onEdit={onEdit} />
            </div> 
          </Tabs.Content>

          <Tabs.Content value="image-notes" asChild>
            <div className="w-full h-full">
              <ImageMetadata />
            </div>
          </Tabs.Content>
        </section>
      </aside>
    </Tabs.Root>
  )

}