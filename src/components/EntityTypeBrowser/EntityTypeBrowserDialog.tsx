import { useEffect, useState } from 'react';
import { Cuboid } from 'lucide-react';
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent } from '@/ui/Dialog';
import { EntityTypeBrowser } from './EntityTypeBrowser';

interface EntityTypeBrowserDialogProps {

  open: boolean;

  onAddEntityType(type: EntityType): void;

  onCancel(): void;

}

export const EntityTypeBrowserDialog = (props: EntityTypeBrowserDialogProps) => {

  const [selected, setSelected] = useState<EntityType | undefined>();

  const onOk = () => {
    if (selected)
      props.onAddEntityType(selected);
  }

  useEffect(() => {
    if (!props.open)
      setSelected(undefined);
  }, [props.open])

  return (
    <Dialog
      open={props.open} 
      onOpenChange={props.onCancel}>
      <DialogContent className="p-0 max-w-lg rounded-lg gap-0" closeIcon={false}>
        <EntityTypeBrowser 
          onSelect={setSelected} 
          onConfirm={props.onAddEntityType} />
    
        <div className="p-1 pt-1.5 border-t flex justify-between text-muted-foreground">
          <EntityTypeEditor>
            <Button variant="ghost" className="text-xs h-8 px-2 rounded-sm mr-2">
              <Cuboid className="h-3.5 w-3.5 mr-1.5" /> Create New Entity Class
            </Button>
          </EntityTypeEditor>

        <div>
          <Button 
            onClick={props.onCancel}
            variant="ghost" className="text-xs h-8 px-2 rounded-sm">
            Cancel
          </Button>

          <Button 
            variant="ghost" 
            className="text-xs h-8 rounded-sm"
            onClick={onOk}>
            OK
          </Button>
        </div>
      </div>

      </DialogContent>
    </Dialog>
  )

}