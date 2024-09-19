import { RelationshipType } from "@/model";
import { useDataModel } from "@/store";
import { Button } from "@/ui/Button";
import { ArrowDownToDot, ArrowUpFromDot, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";

interface RelationshipListItemProps {

  relationshipType: RelationshipType;

  onRemove(): void;

}

export const RelationshipListItem = (props: RelationshipListItemProps) => {

  const { name, sourceTypeId, targetTypeId } = props.relationshipType;

  const model = useDataModel();
  
  const renderEntityType = useCallback((id: string, isSource: boolean) => {
    const entity = model.getEntityType(id);

    return (
      <div className="flex gap-1 items-center text-black text-xs">
        <div className="rounded-full text-white p-1" style={{ backgroundColor: entity.color }}>
          {isSource ? (
            <ArrowUpFromDot className="h-3 w-3 " /> 
          ) : (
            <ArrowDownToDot className="h-3 w-3" />
          )}
        </div>
        <span>{entity.label || entity.id}</span>
      </div>
    )
  }, [model]);

  return (
    <div className="whitespace-nowrap bg-white text-black border shadow-sm rounded pl-4 pr-2 py-1 inline-flex items-center gap-2">
      <span className="font-semibold">{name}</span>

      {sourceTypeId || targetTypeId && (
        <div className="flex gap-4 ml-4 bg-muted py-1 px-2 rounded-md">
          {sourceTypeId && renderEntityType(sourceTypeId, true)}
          {targetTypeId && renderEntityType(targetTypeId, false)}
        </div>
      )}

      <Button 
        className="bg-transparent text-muted-foreground p-2 rounded-full h-auto hover:bg-muted"
        onClick={props.onRemove}>
        <Trash2 size={14} />
      </Button>
    </div>
  )

}