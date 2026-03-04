import { W3CImageAnnotation } from '@annotorious/react';
import { EntityType } from '@/model';
import { useStore } from '@/store';
import { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface SelectFilterOpts {

  entityTypes: EntityType[];

  relationshipNames: string[];

  onSelectFilter(filter: ((a: W3CImageAnnotation) => boolean) | undefined): void;

}

type FilterValue = 'all' 
  | 'with_entity' 
  | 'without_entity' 
  | 'with_relationship' 
  | `entity-${string}`
  | `rel-${string}`;

export const SelectFilter = (props: SelectFilterOpts) => {

  const store = useStore();

  const [filterValue, setFilterValue] = useState<FilterValue | FilterValue[]>('all');

  const onSetValue = (value: FilterValue, checked: boolean) => {
    const bodies = (a: W3CImageAnnotation) => Array.isArray(a.body) ? a.body : [a.body];

    let filter: ((a: W3CImageAnnotation) => boolean) = undefined;

    // Shorthand
    const isOnlySelected = (value: FilterValue) =>
      Array.isArray(filterValue) && filterValue.length === 1 && filterValue[0] === value;

    const resetToAll = () => {
      setFilterValue('all');
      filter = undefined;
    }

    if (value === 'all') {
      // Click 'all' ALWAYS sets 'all' as filterValue (ignore checked) and clears filter
      setFilterValue('all');
    } else if (value === 'with_entity') {
      if (checked) {
        setFilterValue('with_entity');
        filter = (a: W3CImageAnnotation) =>
          bodies(a).some(b => b.purpose === 'classifying');
      } else {
        resetToAll();
      }
    } else if (value === 'without_entity') {
      if (checked) {
        setFilterValue('without_entity');
        filter = (a: W3CImageAnnotation) =>
          bodies(a).every(b => b.purpose !== 'classifying');
      } else {
        resetToAll();
      }
    } else if (value === 'with_relationship') {
      if (checked) {
        setFilterValue('with_relationship');
        filter = (a: W3CImageAnnotation) => 
          store.getRelatedAnnotations(a.id).length > 0;
      } else {
        resetToAll();
      }
    } else if (value.startsWith('entity-')) { 
      if (checked) {
        const updated = Array.isArray(filterValue) 
          ? [...new Set([...filterValue.filter(v => v.startsWith('entity')), value])]
          : [value];

        setFilterValue(updated);

        const ids = updated.map(v => v.substring('entity-'.length));
        filter = (a: W3CImageAnnotation) =>
          bodies(a).some(b => b.purpose === 'classifying' && 'source' in b && ids.includes(b.source));
      } else {
        if (isOnlySelected(value)) {
          resetToAll();
        // Should always be an array at this point!
        } else if (Array.isArray(filterValue)) {
          const updated = filterValue.filter(v => v !== value);

          setFilterValue(updated);

          const ids = updated.map(v => v.substring('entity-'.length));
          filter = (a: W3CImageAnnotation) =>
            bodies(a).some(b => b.purpose === 'classifying' && 'source' in b && ids.includes(b.source));
        }
      }
    } else if (value.startsWith('rel-')) {
      if (checked) {
        const updated = Array.isArray(filterValue) 
          ? [...new Set([...filterValue.filter(v => v.startsWith('rel')), value])]
          : [value];

        setFilterValue(updated);

        // Filter annotations with any relation of the given name
        const names = updated.map(v => v.substring('rel-'.length));
        filter = (a: W3CImageAnnotation) =>
          store.getRelatedAnnotations(a.id).some(([_, meta]) => names.includes(meta?.body?.value));
      } else {
        if (isOnlySelected(value)) {
          resetToAll();
        // Should always be an array at this point!
        } else if (Array.isArray(filterValue)) {
          const updated = filterValue.filter(v => v !== value);

          setFilterValue(updated);

          const names = updated.map(v => v.substring('rel-'.length));
          filter = (a: W3CImageAnnotation) =>
            store.getRelatedAnnotations(a.id).some(([_, meta]) => names.includes(meta?.body?.value));
        }
      }
    }

    props.onSelectFilter(filter);
  }

  const isChecked = (value: FilterValue) =>
    Array.isArray(filterValue) ? filterValue.includes(value) : filterValue === value;

  return (
    <div className="flex text-xs">
      Show <DropdownMenu>
        <DropdownMenuTrigger 
          className="p-0 whitespace-nowrap [&>span]:max-w-24 [&>span]:overflow-hidden [&>span]:text-ellipsis shadow-none font-medium border-none text-xs hover:underline bg-transparent h-auto ml-1.5">
          Filter
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={filterValue === 'all'}
              onCheckedChange={() => onSetValue('all', true)}>
              All
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              disabled={props.entityTypes.length === 0}
              checked={filterValue === 'with_entity'}
              onCheckedChange={checked => onSetValue('with_entity', checked)}>
              With Entity
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem 
              disabled={props.entityTypes.length === 0}
              checked={filterValue === 'without_entity'}
              onCheckedChange={checked => onSetValue('without_entity', checked)}>
              Without Entity
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem 
              disabled={props.relationshipNames.length === 0}
              checked={filterValue === 'with_relationship'}
              onCheckedChange={checked => onSetValue('with_relationship', checked)}>
              With Relation
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>

          {props.entityTypes.length > 0 && (
            <DropdownMenuGroup>
              <DropdownMenuLabel>Entity Classes</DropdownMenuLabel>

              {props.entityTypes.map(type => (
                <DropdownMenuCheckboxItem
                  key={type.id}
                  checked={isChecked(`entity-${type.id}`)}
                  onCheckedChange={checked => onSetValue(`entity-${type.id}`, checked)}>
                  {type.label || type.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          )}

          {props.relationshipNames.length > 0 && (
            <DropdownMenuGroup>
              <DropdownMenuLabel>Relationship Types</DropdownMenuLabel>
              {props.relationshipNames.map(name => (
                <DropdownMenuCheckboxItem 
                  key={name}
                  checked={isChecked(`rel-${name}`)}
                  onCheckedChange={checked => onSetValue(`rel-${name}`, checked)}>
                  {name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

}