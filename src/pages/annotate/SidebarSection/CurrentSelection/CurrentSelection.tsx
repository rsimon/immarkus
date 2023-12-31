import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ImageAnnotation, createBody } from '@annotorious/react';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent } from '@/ui/Dialog';
import { AnnotationCommands } from '@/components/AnnotationCommands';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { CurrentSelectionMetadata } from './CurrentSelectionMetadata';
import { CurrentSelectionTagList } from './CurrentSelectionTagList';
import { useAnnotoriousManifold, useSelection } from '@annotorious/react-manifold';
import { Separator } from '@/ui/Separator';

export const CurrentSelection = () => {

  const anno = useAnnotoriousManifold();

  const selection = useSelection<ImageAnnotation>();

  const selected: ImageAnnotation | undefined = 
    selection.selected?.length > 0 ? selection.selected[0].annotation : undefined;

  const ref = useRef<HTMLButtonElement>();

  const [commandsOpen, setCommandsOpen] = useState(false);

  const [showAsEmpty, setShowAsEmpty] = useState(!selected?.bodies || selected.bodies.length === 0);

  useEffect(() => {
    if (selected) { 
      ref.current?.focus();
      setShowAsEmpty(!selected.bodies || selected.bodies.length === 0);
    }
  }, [selected]);

  const onDelete = () => 
    anno.deleteAnnotation(selected.id);

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key !== 'Tab')
      !commandsOpen && setCommandsOpen(true)
  }

  const onAddEntityType = (entity: EntityType) => {
    const body = createBody(selected, {
      type: 'Dataset',
      purpose: 'classifying',
      source: entity.id
    }, new Date());

    anno.addBody(body);

    setCommandsOpen(false);
  }

  return !selected ? (
    <div className="flex rounded text-sm justify-center items-center w-full text-muted-foreground">
      No annotation selected
    </div> 
  ) : (
    <div key={selected.id} className="flex flex-col grow h-full">
      {showAsEmpty ? (
        <div className="flex grow justify-center items-center">
          <div>
            <Button
              ref={ref}
              onClick={() => setCommandsOpen(true)}
              onKeyDown={onKeyDown}
              className="px-3 mr-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">Add Tag</Button>

            <Button
              onClick={() => setShowAsEmpty(false)}
              variant="outline">Add Note</Button>
          </div>
        </div>
      ) : (
        <div className="grow">
          <CurrentSelectionTagList 
            annotation={selected} 
            onAddTag={() => setCommandsOpen(true)} />
          
          <Separator className="mb-4" />

          <CurrentSelectionMetadata
            annotation={selected} />
        </div>
      )}

      <Dialog open={commandsOpen} onOpenChange={setCommandsOpen}>
        <DialogContent className="p-0 max-w-md rounded-lg">
          <AnnotationCommands 
            onAddEntityType={onAddEntityType} 
            onAddTag={() => setCommandsOpen(false)} />
        </DialogContent>
      </Dialog>
  
      <footer>
        <ConfirmedDelete
          variant="destructive" 
          className="w-full mt-6 mb-2"
          label="This action will delete the annotation permanently."
          onConfirm={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete Annotation
        </ConfirmedDelete>
      </footer>
    </div>
  )

}