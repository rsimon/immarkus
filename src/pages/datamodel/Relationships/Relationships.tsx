import { Spline } from 'lucide-react';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { RelationshipEditor } from '@/components/RelationShipEditor';

export const Relationships = () => {

  const { relationshipTypes } =  useDataModel();
 
  return (
    <div>
      <p className="p-1 mt-4 text-sm max-w-xl leading-6">
        You can connect two annotations through a Relationship. A Relationship must have a 
        relationship type, such as 'is next to' or 'is part of'.
      </p>

      <div className="text-sm p-1">
        {relationshipTypes.length === 0 ? (
          <p className="h-24 text-muted-foreground flex items-center">
            No relationship types defined
          </p>
        ) : (
          <ul>
            {relationshipTypes.map(t => (
              <li>{t}</li>
            ))}
          </ul>  
        )}
      </div>

      <div className="flex mt-4 gap-2">
        <RelationshipEditor>
          <Button>
            <Spline size={16} className="mr-2" /> Add Relationship Type
          </Button>
        </RelationshipEditor>
      </div>
    </div>
  )

}