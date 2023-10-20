import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createBody, useAnnotationStore, useSelection } from '@annotorious/react';
import { Entity } from '@/model';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent } from '@/ui/Dialog';
import { AnnotationCommands } from '@/components/AnnotationCommands';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { EditorPanelProps } from '../EditorPanel';

export const CurrentSelection = (props: EditorPanelProps) => {

  const store = useAnnotationStore();

  const { selected } = useSelection();

  const empty = selected.length === 0;

  const ref = useRef<HTMLButtonElement>();

  const [commandsOpen, setCommandsOpen] = useState(false);

  useEffect(() => {
    if (selected.length > 0) ref.current.focus();
  }, [selected]);

  const onDelete = () =>
    store.bulkDeleteAnnotation(selected.map(s => s.annotation.id));

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key !== 'Tab')
      !commandsOpen && setCommandsOpen(true)
  }

  const onAddEntity = (entity: Entity) => {
    // We only support single selection so far
    const annotation = selected[0].annotation;

    // @ts-ignore
    const body = createBody(annotation, {
      type: 'SpecificResource',
      purpose: 'classifying',
      source: entity.id
    }, new Date());

    store.addBody(body);
  }

  return empty ? (
    <div className="flex rounded text-sm justify-center items-center w-full text-muted-foreground">
      No annotation selected
    </div> 
  ) : (
    <div className="flex flex-col grow">
      <div className="flex grow justify-center items-center">
        <div>
          <Button
            ref={ref}
            onClick={() => setCommandsOpen(true)}
            onKeyDown={onKeyDown}
            className="px-3 mr-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">Add Tag</Button>

          <Dialog open={commandsOpen} onOpenChange={setCommandsOpen}>
            <DialogContent className="p-0 max-w-md rounded-lg">
              <AnnotationCommands 
                onAddEntity={onAddEntity} 
                onAddTag={() => console.log('todo')} />
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline">Add Note</Button>
        </div>
      </div>

      <footer>
        <ConfirmedDelete
          variant="destructive" 
          className="w-full mt-2"
          label="This action will delete the annotation permanently."
          onConfirm={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete Annotation
        </ConfirmedDelete>
      </footer>

      {/*
      <div className="mt-2 mb-6 p-1 justify-center flex flex-wrap gap-1">
        <span
          className="rounded-full px-2.5 py-1 inline-flex items-center text-xs"
          style={{ 
            backgroundColor: '#ff0000',
            color: '#fff' 
          }}>

          Watchtower
        </span>

        <span
          className="rounded-full pl-2.5 pr-1 py-0.5 inline-flex items-center text-xs"
          style={{ 
            backgroundColor: '#00aa00',
            color: '#fff' 
          }}>

          part of 

          <span 
            style={{ padding: '1px 5px'}}
            className="ml-2 bg-white/60 rounded-lg text-green-700">City Wall</span>
        </span>

        <span
          className="rounded-full pl-2.5 pr-1 py-0.5 inline-flex items-center text-xs"
          style={{ 
            backgroundColor: '#00aa00',
            color: '#fff' 
          }}>

          part of 

          <span 
            style={{ padding: '1px 5px'}}
            className="ml-2 bg-white/60 rounded-lg text-green-700">Gate</span>
        </span>

        <span
          className="rounded-full pl-2 pr-2 py-1 inline-flex items-center text-xs"
          style={{ 
            backgroundColor: '#aaaa00',
            color: '#fff' 
          }}>

          <Tags className="h-4 w-4 mr-1" /> MyTag
        </span>
      </div>

      <div className="border-t">
        <AnnotationCommands />
      </div>
      */}
    </div>
  )

}