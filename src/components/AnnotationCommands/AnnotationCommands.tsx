import { Ban, Check, Cuboid } from 'lucide-react';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { EntityTypeEditor } from '../EntityTypeEditor';
import { DataModelSearch } from '../DataModelSearch';

interface AnnotationCommandProps {

  onAddEntityType(type: EntityType): void;

}

export const AnnotationCommands = (props: AnnotationCommandProps) => {

  return (
    <div>
      <DataModelSearch />
  
      <div className="p-1 pt-1.5 border-t flex justify-between text-muted-foreground">
        <EntityTypeEditor>
          <Button variant="ghost" className="text-xs h-8 px-2 rounded-sm mr-2">
            <Cuboid className="h-3.5 w-3.5 mr-1.5" /> Create new entity
          </Button>
        </EntityTypeEditor>

        <div>
          <Button variant="ghost" className="text-xs h-8 px-2 rounded-sm">
            Cancel
          </Button>

          <Button variant="ghost" className="text-xs h-8 px-2 rounded-sm">
            OK
          </Button>
        </div>
      </div>
    </div>
  )

}