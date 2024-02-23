import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ImageAnnotation, createBody } from '@annotorious/react';
import { useAnnotoriousManifold, useSelection } from '@annotorious/react-manifold';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { DataModelSearchDialog } from '@/components/DataModelSearch';
import { PropertiesForm } from './PropertiesForm';

export const CurrentSelection = () => {

  const anno = useAnnotoriousManifold();

  const selection = useSelection<ImageAnnotation>();

  const selected: ImageAnnotation | undefined = 
    selection.selected?.length > 0 ? selection.selected[0].annotation : undefined;

  const ref = useRef<HTMLButtonElement>();

  const [showSearchDialog, setShowSearchDialog] = useState(false);

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
      !showSearchDialog && setShowSearchDialog(true)
  }

  const onAddEntityType = (entity: EntityType) => {
    const body = createBody(selected, {
      type: 'Dataset',
      purpose: 'classifying',
      source: entity.id
    }, new Date());

    anno.addBody(body);

    setShowSearchDialog(false);
  }

  return !selected ? (
    <div className="flex rounded text-sm justify-center items-center w-full text-muted-foreground">
      No annotation selected
    </div> 
  ) : (
    <div key={selected.id} className="flex flex-col grow h-full max-w-full">
      {showAsEmpty ? (
        <div className="flex grow justify-center items-center">
          <div>
            <Button
              ref={ref}
              onClick={() => setShowSearchDialog(true)}
              onKeyDown={onKeyDown}
              className="px-3 mr-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">Add Tag</Button>

            <Button
              onClick={() => setShowAsEmpty(false)}
              variant="outline">Add Note</Button>
          </div>
        </div>
      ) : (
        <PropertiesForm 
          annotation={selected} 
          onAddTag={() => setShowSearchDialog(true)} />
      )}

      <DataModelSearchDialog 
        open={showSearchDialog} 
        onAddEntityType={onAddEntityType}
        onCancel={() => setShowSearchDialog(false)} />
  
      <footer>
        <ConfirmedDelete
          variant="destructive" 
          className="w-full mt-2 mb-2"
          label="This action will delete the annotation permanently."
          onConfirm={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete Annotation
        </ConfirmedDelete>
      </footer>
    </div>
  )

}