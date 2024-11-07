import { ImageAnnotation } from '@annotorious/react';
import { EntityType } from '@/model';
import { useStore } from '@/store';
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectLabel,
  SelectTrigger, 
  SelectValue,
  UndecoratedSelectItem
} from '@/ui/Select';

interface SelectFilterOpts {

  entityTypes: EntityType[];

  relationshipNames: string[];

  onSelect(filter: ((a: ImageAnnotation) => boolean) | undefined): void;

}

export const SelectFilter = (props: SelectFilterOpts) => {

  const store = useStore();

  const onValueChange = (value: string) => {
    let filter: ((a: ImageAnnotation) => boolean) = undefined;

    if (value === 'all_entity') {
      // Filter all annotations with any 'classifying' body
      filter = (a: ImageAnnotation) =>
        a.bodies.some(b => b.purpose === 'classifying');
    } else if (value === 'all_relationship') {
      // Filter all annotations with related annotations
      filter = (a: ImageAnnotation) => 
        store.getRelatedAnnotations(a.id).length > 0;
    } else if (value.startsWith('entity-')) { 
      // Filter annotations with the given 'classifying' source
      const id = value.substring('entity-'.length);

      filter = (a: ImageAnnotation) =>
        a.bodies.some(b => b.purpose === 'classifying' && 'source' in b && b.source === id);
    } else if (value.startsWith('rel-')) {
      // Filter annotations with any relation of the given name
      const name = value.substring('rel-'.length);

      filter = (a: ImageAnnotation) =>
        store.getRelatedAnnotations(a.id).some(([_, meta]) => meta?.body?.value === name);
    }

    props.onSelect(filter);
  }

  return (
    <div className="flex text-xs">
      Show <Select defaultValue="all" onValueChange={onValueChange}>
        <SelectTrigger 
          className="p-0 whitespace-nowrap [&>span]:max-w-24 [&>span]:overflow-hidden [&>span]:text-ellipsis shadow-none font-medium border-none text-xs hover:underline bg-transparent h-auto ml-1.5">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <UndecoratedSelectItem value="all">
            all
          </UndecoratedSelectItem>

          <UndecoratedSelectItem 
            disabled={props.entityTypes.length === 0}
            value="all_entity">
            with Entity
          </UndecoratedSelectItem>

          <UndecoratedSelectItem 
            disabled={props.relationshipNames.length === 0}
            value="all_relationship">
            with Relation
          </UndecoratedSelectItem>

          {props.entityTypes.length > 0 && (
            <SelectGroup>
              <SelectLabel>Entity Classes</SelectLabel>
              {props.entityTypes.map(type => (
                <UndecoratedSelectItem 
                  key={type.id}
                  value={`entity-${type.id}`}>
                  {type.label || type.id}
                </UndecoratedSelectItem>
              ))}
            </SelectGroup>
          )}

          {props.relationshipNames.length > 0 && (
            <SelectGroup>
              <SelectLabel>Relationship Types</SelectLabel>
              {props.relationshipNames.map(name => (
                <UndecoratedSelectItem 
                  key={name}
                  value={`rel-${name}`}>
                  {name}
                </UndecoratedSelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  )

}