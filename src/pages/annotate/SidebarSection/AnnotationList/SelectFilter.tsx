import { ImageAnnotation } from '@annotorious/react';
import { EntityType } from '@/model';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface SelectFilterOpts {

  entityTypes: EntityType[];

  onSelect(filter: ((a: ImageAnnotation) => boolean) | undefined): void;

}

export const SelectFilter = (props: SelectFilterOpts) => {

  const onValueChange = (value: string) => {
    if (value === 'all') {
      props.onSelect(undefined);
    } else {
      const id = value.substring('entity-'.length);

      const filter = (a: ImageAnnotation) =>
        a.bodies.some(b => b.purpose === 'classifying' && 'source' in b && b.source === id);

      props.onSelect(filter);
    }
  }

  return (
    <div className="flex text-xs">
      Show <Select defaultValue="all" onValueChange={onValueChange}>
        <SelectTrigger 
          className="p-0 shadow-none font-medium border-none text-xs hover:underline bg-transparent h-auto ml-1.5">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">all</SelectItem>

          {props.entityTypes.map(type => (
            <SelectItem 
              key={type.id}
              value={`entity-${type.id}`}>{type.label || type.id}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

}