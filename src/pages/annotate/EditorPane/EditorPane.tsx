import { Image } from '@/model';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import { AnnotationsTab } from './AnnotationsTab';
import { NotesTab } from './NotesTab';

import './EditorPane.css';

export interface EditorPaneProps {

  image: Image;

  onSaving(): void;

  onSaved(): void;

  onError(error: Error): void;

}

export const EditorSidebar = (props: EditorPaneProps) => {

  return (
    <aside className="editor-pane">
      <Tabs defaultValue="notes" className="w-[300px]">
        <TabsList className="mb-2">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="annotations">Annotations</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <NotesTab {...props} />
        </TabsContent>

        <TabsContent value="annotations">
          <AnnotationsTab {...props} />
        </TabsContent>
      </Tabs>
    </aside>
  )

}