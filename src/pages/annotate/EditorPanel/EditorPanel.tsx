import { useSelection } from '@annotorious/react';
import { useEffect, useState } from 'react';
import { Image, MessagesSquare, MousePointerSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { EditorPanelProps } from './EditorPanelProps';
import { CurrentSelection } from '../CurrentSelection';
import { ImageNotes } from '../ImageNotes';

export const EditorPanel = (props: EditorPanelProps) => {

  const { selected } = useSelection();

  const [tab, setTab] = useState('selection');

  useEffect(() => {
    // Switch to selection when the user selects an annotation
    if (selected.length > 0)
      setTab('selection');
  }, [selected]);

  return (
    <Tabs 
      value={tab}
      onValueChange={setTab} 
      className="min-h-full flex flex-col">

      <TabsList className="mb-2 self-start">
        <TabsTrigger value="selection">
          <MousePointerSquare className="h-4 w-4 mr-2" /> Selection
        </TabsTrigger>
        <TabsTrigger value="list">
          <MessagesSquare className="h-4 w-4 mr-2" /> List
        </TabsTrigger>
        <TabsTrigger value="notes">
          <Image className="h-4 w-4 mr-2" /> Image  
        </TabsTrigger>
      </TabsList>

      <TabsContent value="selection">
        <CurrentSelection {...props} />
      </TabsContent>

      <TabsContent value="list">
        <div className="py-4 text-sm flex grow items-center justify-center text-muted-foreground">
          Coming soon...
        </div>
      </TabsContent>

      <TabsContent value="notes">
        <ImageNotes {...props} />
      </TabsContent>
    </Tabs>
  )

} 