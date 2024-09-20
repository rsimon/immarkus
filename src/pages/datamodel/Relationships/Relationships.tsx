import { useState } from 'react';
import { Spline } from 'lucide-react';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { RelationshipTypeEditor } from '@/components/RelationshipTypeEditor';
import { RelationshipListItem } from './RelationshipListItem';
import { RelationshipType } from '@/model';

export const Relationships = () => {

  const { relationshipTypes, removeRelationShipType } =  useDataModel();

  const [edited, setEdited] = useState<RelationshipType | undefined>();

  const onRemove = (name: string) => () => {
    removeRelationShipType(name).catch(error => {
      console.error(error);
    });
  }
 
  return (
    <>
      <div>
        <p className="p-1 mt-4 text-sm max-w-xl leading-6">
          You can connect two annotations through a Relationship. A Relationship must have a 
          relationship type, such as 'is next to' or 'is part of'.
        </p>

        <div className="mt-4 text-xs border p-3 rounded bg-muted text-muted-foreground max-w-5xl">
          {relationshipTypes.length === 0 ? (
            <p className="h-8 box-content p-1 flex items-center justify-center text-muted-foreground/60">
              No relationship types defined
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {relationshipTypes.map(t => (
                <li key={t.name}>
                  <RelationshipListItem 
                    relationshipType={t} 
                    onRemove={onRemove(t.name)} 
                    onEdit={() => setEdited(t)} />
                </li>
              ))}
            </ul>  
          )}
        </div>

        <div className="flex mt-4 gap-2">
          <RelationshipTypeEditor>
            <Button>
              <Spline size={16} className="mr-2" /> Add Relationship Type
            </Button>
          </RelationshipTypeEditor>
        </div>
      </div>

      {Boolean(edited) && (
        <RelationshipTypeEditor 
          open={true} 
          relationshipType={edited}
          onClose={() =>setEdited(undefined)} />
      )}
    </>
  )

}