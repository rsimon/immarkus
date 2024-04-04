import { useEffect, useMemo, useState } from 'react';
import { Spline } from 'lucide-react';
import { RelationPropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Autosuggest } from '@/ui/Autosuggest';
import { Label } from '@/ui/Label';
import { cn } from '@/ui/utils';
import { EntityInstance, useEntityInstanceSearch } from './useEntityInstanceSearch';
import { InfoTooltip } from '../InfoTooltip';
import { InheritedFrom } from '../InheritedFrom';

interface RelationFieldProps {

  id: string;

  className?: string;

  definition: RelationPropertyDefinition;

  value?: { type: string; instance: string };

  onChange?(value: { type: string; instance: string }): void;

}

export const RelationField = (props: RelationFieldProps) => {

  const { definition } = props;
  
  const [value, setValue] = useState<EntityInstance>(props.value);

  const className = cn(props.className, 'mt-0.5');

  const datamodel = useDataModel();

  const entityType = useMemo(() =>
    datamodel.getEntityType(props.definition.targetType), [props.definition]);

  useEffect(() => {
    if (props.onChange)
      props.onChange(value);
  }, [value]);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const search = useEntityInstanceSearch({ 
    type: props.definition.targetType,
    field: props.definition.labelProperty
  });

  const onChange = (instance: string) =>
    setValue({ type: props.definition.targetType, ...value, instance });

  const onSelect = (item: EntityInstance & { id: string }) => {
    const { id, ...instance } = item;
    setValue(instance);
  }
  
  const getSuggestions = (query: string) => 
    search.initialized 
      ? search.searchEntityInstances(query).map(i => ({ id: i.instance, ...i }))
      : [];

  const renderSuggestion = ({ id }) => id;

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between pr-1 mb-1.5">
        <div className="flex">
          <Label
            htmlFor={props.id}
            className="text-sm inline-block ml-0.5 ">
            {definition.name}
          </Label>

          {entityType && (
            <div 
              className="inline-flex text-xs items-center gap-1 ml-1.5 mr-1 relative bottom-[1px] border pl-1 pr-1.5 rounded text-black/70">
              <Spline className="h-3.5 w-3.5" />
              {entityType.label || entityType.id}
            </div>
          )}

          {definition.description && (
            <InfoTooltip description={definition.description} />
          )}
        </div>
        
        <InheritedFrom definition={definition} />
      </div>

      <Autosuggest
        id={props.id}
        disabled={!search.initialized}
        className={className}
        value={value?.instance}
        placeholder={entityType && `Search '${entityType.label || entityType.id}' tags...`}
        onChange={onChange}
        onSelect={onSelect}
        getSuggestions={getSuggestions}
        renderSuggestion={renderSuggestion} />
    </div>
  );

}