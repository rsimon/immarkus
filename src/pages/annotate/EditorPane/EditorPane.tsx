import { useEffect, useState } from 'react';
import { useSelection } from '@annotorious/react';
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

  const { selected } = useSelection();

  const [tab, setTab] = useState('notes');

  useEffect(() => {
    // Switch to annotation tab every time
    // the user selects an annotation
    if (selected.length > 0)
      setTab('annotations');
  }, [selected]);

  return (
    <aside className="editor-pane">
      <Tabs 
        value={tab}
        onValueChange={setTab} 
        className="w-[300px] min-h-full flex flex-col">

        <TabsList className="mb-2 self-start">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="annotations">Annotations</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <NotesTab {...props} />
        </TabsContent>

        <TabsContent value="annotations" className="flex grow">
          <AnnotationsTab {...props} />
        </TabsContent>
      </Tabs>
    </aside>
  )

}