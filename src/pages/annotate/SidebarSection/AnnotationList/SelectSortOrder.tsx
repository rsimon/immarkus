import { ImageAnnotation } from '@annotorious/react';
import { useDataModel } from '@/store';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface SelectSortOrderProps {

  onSelect(sort: ((a: ImageAnnotation, b: ImageAnnotation) => number)): void;

}

const SORT_BY_CREATED_ASCENDING = (a: ImageAnnotation, b: ImageAnnotation) => {
  if (!a.target.created && !b.target.created) return 0;
  if (!a.target.created) return 1;
  if (!b.target.created) return -1;
  return a.target.created.getTime() - b.target.created.getTime();
}

const SORT_BY_CREATED_DESCENDING = (a: ImageAnnotation, b: ImageAnnotation) => {
  if (!a.target.created && !b.target.created) return 0;
  if (!a.target.created) return -1;
  if (!b.target.created) return 1;
  return b.target.created.getTime() - a.target.created.getTime();
}

export const DEFAULT_SORTING = SORT_BY_CREATED_DESCENDING;

export const SelectSortOrder = (props: SelectSortOrderProps) => {

  const datamodel = useDataModel();

  // Define inside SelectSortOrder, for datamodel closure
  const SORT_BY_FIRST_ENTITY = (a: ImageAnnotation, b: ImageAnnotation) => {
    const getFirstEntity = (anno: ImageAnnotation) => {
      const tag = anno.bodies.find(b => b.purpose === 'classifying' && 'source' in b);
      if (tag) {
        return datamodel.getEntityType((tag as any).source);
      }
    }

    const firstEntityA = getFirstEntity(a);
    const firstEntityB = getFirstEntity(b);

    if (!firstEntityA && !firstEntityB) return 0;
    if (!firstEntityA) return 1;
    if (!firstEntityB) return -1;

    return (firstEntityA.label || firstEntityA.id).localeCompare(firstEntityB.label || firstEntityB.id);
  }
  
  const onValueChange = (value: string) => {
    if (value === 'recent')
      props.onSelect(SORT_BY_CREATED_DESCENDING);
    else if (value === 'oldest')
      props.onSelect(SORT_BY_CREATED_ASCENDING);
    else if (value === 'entity')
      props.onSelect(SORT_BY_FIRST_ENTITY);
  }

  return (
    <div className="flex text-xs">
      Sort by <Select defaultValue="recent" onValueChange={onValueChange}>
        <SelectTrigger 
          className="p-0 shadow-none font-medium border-none text-xs hover:underline bg-transparent h-auto ml-1.5">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="recent">most recent</SelectItem>
          <SelectItem value="oldest">oldest</SelectItem>
          <SelectItem value="entity">entity</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

}