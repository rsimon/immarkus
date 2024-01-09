import { ListTree } from 'lucide-react';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { DEFAULT_COLOR, getForegroundColor } from '@/utils/color';

interface DataModelSearchResultProps {

  type: EntityType;

  highlighted: boolean;

  selected?: EntityType;

}

export const DataModelSearchResult = (props: DataModelSearchResultProps) => {

  const { type, highlighted, selected } = props;

  const model = useDataModel();

  const parent = type.parentId ? model.getEntityType(type.parentId) : undefined;   

  const children = model.getChildTypes(type.id);

  const color = type.color || DEFAULT_COLOR;

  return (
    <div 
      className="pl-1 pr-2 py-1 rounded-sm data-[highlighted]:bg-accent cursor-pointer" 
      data-highlighted={highlighted ? 'true' : undefined}>
      
      <div className="flex justify-between text-muted-foreground text-xs">
        <div className="flex items-center">
          <span 
            className="pip-small ml-1.5"
            style= {{
              backgroundColor: color,
              color: getForegroundColor(color)
            }} />

          <span 
            className="inline-flex items-end pl-1.5 pr-1 py-0.5 rounded-sm text-black">
            {type.label || type.id}
          </span>

          {parent && (
            <span>
              ({parent.label || parent.id})
            </span>
          )}
        </div>

        <div>
          {children.length > 0 && (
            <div className="flex text-[11px] items-center mt-[0.5px]">
              <ListTree className="w-3.5 h-3.5" />

              <span className="ml-0.5 mt-[0.5px]">
                {children.length} child{children.length > 1 && 'ren'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

}