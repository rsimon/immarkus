import { RelationshipType } from "@/model";
import { Button } from "@/ui/Button";
import { Trash2 } from "lucide-react";

interface RelationshipListItemProps {

  relationshipType: RelationshipType;

  onRemove(): void;

}

export const RelationshipListItem = (props: RelationshipListItemProps) => {

  return (
    <div className="bg-white border shadow-sm rounded pl-4 pr-2 py-1 inline-flex items-center gap-2">
      {props.relationshipType.name}

      <Button 
        className="bg-transparent text-muted-foreground p-2 rounded-full h-auto hover:bg-muted"
        onClick={props.onRemove}>
        <Trash2 size={14} />
      </Button>
    </div>
  )

}