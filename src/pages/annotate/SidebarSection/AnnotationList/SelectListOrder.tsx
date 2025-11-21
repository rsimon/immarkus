import { useEffect } from 'react';
import { W3CImageAnnotation } from '@annotorious/react';
import { useDataModel } from '@/store';
import { usePersistentState } from '@/utils/usePersistentState';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from 'lucide-react';

interface SelectListOrderProps {

  onChangeOrdering(sort?: ((a: W3CImageAnnotation, b: W3CImageAnnotation) => number)): void;

}

const SORT_BY_CREATED_ASCENDING = (a: W3CImageAnnotation, b: W3CImageAnnotation) => {
  if (!a.created && !b.created) return 0;
  if (!a.created) return 1;
  if (!b.created) return -1;
  return new Date(a.created).getTime() - new Date(b.created).getTime();
}

const SORT_BY_CREATED_DESCENDING = (a: W3CImageAnnotation, b: W3CImageAnnotation) => {
  if (!a.created && !b.created) return 0;
  if (!a.created) return -1;
  if (!b.created) return 1;
  return new Date(b.created).getTime() - new Date(a.created).getTime();
}

export const DEFAULT_SORTING = SORT_BY_CREATED_DESCENDING;

export const SelectListOrder = (props: SelectListOrderProps) => {

  const datamodel = useDataModel();

  const [value, setValue] = usePersistentState('immarkus:annotate:list:sort', 'recent');

  useEffect(() => {
    if (value === 'recent')
      props.onChangeOrdering(SORT_BY_CREATED_DESCENDING);
    else if (value === 'oldest')
      props.onChangeOrdering(SORT_BY_CREATED_ASCENDING);
    else if (value === 'entity')
      props.onChangeOrdering(SORT_BY_FIRST_ENTITY);
    else if (value === 'custom')
      props.onChangeOrdering(undefined);
  }, [value]);

  // Define inside SelectSortOrder, for datamodel closure
  const SORT_BY_FIRST_ENTITY = (a: W3CImageAnnotation, b: W3CImageAnnotation) => {
    const getFirstEntity = (anno: W3CImageAnnotation) => {
      const bodies = Array.isArray(anno.body) ? anno.body : [anno.body];
      const tag = bodies.find(b => b.purpose === 'classifying' && 'source' in b);
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
  
  return (
    <div className="flex text-xs items-center">
      <ArrowDownWideNarrow className="size-4 mt-0.5" /> 
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger 
          className="p-0 shadow-none font-medium border-none text-xs hover:underline bg-transparent h-auto ml-1.5">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="recent">recent</SelectItem>
          <SelectItem value="oldest">oldest</SelectItem>
          <SelectItem value="entity">entity</SelectItem>
          <SelectItem value="custom">custom</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

}