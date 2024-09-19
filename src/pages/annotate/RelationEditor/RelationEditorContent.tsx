import { useMemo, useState } from 'react';
import { CirclePlus, Spline } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { Combobox, ComboboxOption, ComboboxState } from '@/components/Combobox';
import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Skeleton';

interface RelationEditorContentProps {
  
  source: ImageAnnotation;

  target?: ImageAnnotation;

  onSave(source: ImageAnnotation, target: ImageAnnotation, relation: string): void;

  onCancel(): void;

}

export const RelationEditorContent = (props: RelationEditorContentProps) => {

  const { source, target } = props;

  const model = useDataModel();

  const options = useMemo(() => { 
    const getEntityTypes = (annotation: ImageAnnotation) => {
      // The entity type ID tags on this annotation
      const entityIds = annotation.bodies
        .filter(b => b.purpose === 'classifying')
        .map(body => (body as any).source as string);

      // Resolve full parent hierarchy
      const withAncestors = entityIds.reduce<string[]>((all, entityId) => {
        return [...all, ...model.getAncestors(entityId).map(t => t.id)];
      }, [...entityIds]);

      // All entity classes the annotation is tagged with, incl. hierachical ancestors
      return new Set(withAncestors); 
    }

    const sourceTypes = getEntityTypes(source);
    const targetTypes = target ? getEntityTypes(target) : undefined;

    const filteredBySource = model.relationshipTypes
      .filter(type => !type.sourceTypeId || sourceTypes.has(type.sourceTypeId));

    const filteredByTarget = targetTypes 
      ? filteredBySource.filter(type => !type.targetTypeId || targetTypes.has(type.targetTypeId))
      : filteredBySource; // No target yet - show all 

    return filteredByTarget.map(t => ({ label: t.name, value: t.name }))
  }, [source, target, model]);
  
  const [relation, setRelation] = useState<ComboboxOption | undefined>();

  const [addTerm, setAddTerm] = useState<string | undefined>();

  const onComboboxStateChange = (state: ComboboxState) => {
    // If the current search DOES NOT match the selected value, show 'add to vocab' button
    const { search, value } = state;
    const isMatch = search === value?.label;
    setAddTerm(isMatch ? undefined : search);
  }

  const onAddTerm = (term: string) => {
    model.addRelationshipType({ name: term });
    setRelation(({ value: term, label: term }));
    setAddTerm(undefined);
  }

  const onSave = () => {
    if (props.target && relation)
      props.onSave(source, props.target, relation.value);
  }

  return (
    <div>
      <h3 className="flex text-xs text-muted-foreground items-center gap-1 font-medium">
        <Spline className="h-4 w-4" /> Create Relation
      </h3>

      <ol className="list-decimal list-inside">
        <li className="text-xs mt-5 flex-shrink-0">
          Select a target annotation.

          <div className="mt-3 mb-1 ml-4 w-56 flex gap-1 justify-between items-center relative">
            <AnnotationThumbnail 
              annotation={props.source} 
              className="w-12 h-12 border-fuchsia-600 border-2 shadow flex-shrink-0" />

            <div className="overflow-hidden relative py-[5px] flex-grow">
              <div 
                className={`w-full h-0 relative border-green-500 border-t-2 border-dashed ${props.target ? '' : 'animate-grow-width'}`}>
                <div className="absolute right-0 -top-[4px] w-[6px] h-[6px] bg-green-500 rounded-full" />
              </div>
            </div>

            {props.target ? (
              <AnnotationThumbnail 
                annotation={props.target} 
                className="w-12 h-12 border-2 border-green-500 shadow flex-shrink-0" />
            ) : (
              <Skeleton className="border border-gray-300 w-12 h-12 bg-white" />
            )}
          </div>
        </li>

        <li className="text-xs mt-6 mb-1 flex-shrink-0">
          Choose a relation type.

          <div className="ml-4 mt-2">
            <Combobox
              className="w-56"
              value={relation}
              options={options}
              onChange={setRelation}
              onStateChange={onComboboxStateChange}>

              {addTerm && (
                <div className="p-2 border-t bg-muted">
                  <p className="p-1 pb-2 text-center text-xs text-muted-foreground">
                    Add to vocabulary:
                  </p>
                  <Button 
                    size="sm"
                    className="w-full font-semibold text-xs"
                    onClick={() => onAddTerm(addTerm)}>
                    <CirclePlus className="h-4 w-4 mr-2" />{addTerm}
                  </Button>
                </div>
              )}

            </Combobox>
          </div>
        </li>
      </ol>

      <Button 
        className="mt-6 w-full"
        disabled={!relation || !props.target}
        onClick={onSave}>Save</Button>

      <Button
        variant="outline"
        className="mt-2 w-full"
        onClick={props.onCancel}>
        Cancel
      </Button>
    </div>
  )

}