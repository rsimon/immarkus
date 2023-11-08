import { Image, MessagesSquare, MousePointerSquare } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { Separator } from '@/ui/Separator';
import { AnnotationList } from './AnnotationList';

export const SidebarSection = () => {

  return (
        <aside className="absolute top-0 right-0 h-full w-[340px] flex flex-col">
          <Tabs.Root asChild defaultValue="selection">
            <>
              <section className="toolbar border-b h-[46px] flex items-center">
                <Separator orientation="vertical" className="h-4" />

                <Tabs.List className="flex gap-1.5 py-0.5 px-2">
                  <Tabs.Trigger value="selection" className="p-2 flex text-xs rounded-md bg-black text-white">
                    <MousePointerSquare className="h-4 w-4 mr-1" /> Selection
                  </Tabs.Trigger>

                  <Tabs.Trigger value="annotation-list" className="p-2 flex text-xs rounded-md hover:bg-muted text-muted-foreground">
                    <MessagesSquare className="h-4 w-4 mr-1" /> List
                  </Tabs.Trigger>

                  <Tabs.Trigger value="image-notes" className="p-2 flex text-xs rounded-md hover:bg-muted text-muted-foreground">
                    <Image className="h-4 w-4 mr-1" /> Image Notes
                  </Tabs.Trigger>
                </Tabs.List>
              </section>

              <section className="sidebar-content bg-muted/80 flex flex-grow border-l">
                <Tabs.Content value="selection" asChild>
                  <div className="flex flex-grow text-sm justify-center items-center w-full text-muted-foreground">
                    No annotation selected
                  </div> 
                </Tabs.Content>

                <Tabs.Content value="annotation-list" asChild>
                  <div className="flex flex-grow text-sm justify-center items-center w-full text-muted-foreground">
                    <AnnotationList />
                  </div> 
                </Tabs.Content>

                <Tabs.Content value="image-notes" asChild>
                  <div className="flex flex-grow text-sm justify-center items-center w-full text-muted-foreground">
                    Image Notes
                  </div> 
                </Tabs.Content>
              </section>
            </>
          </Tabs.Root>
        </aside>
 
  )

}