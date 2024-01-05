import { PlusCircle } from 'lucide-react';
import { AnnotationBody, ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { useDataModel } from '@/store';
import { EntityBadge } from '@/components/EntityBadge';
import { Button } from '@/ui/Button';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';

interface CurrentSelectionTagListProps {

  annotation: ImageAnnotation;

  onAddTag(): void;

}

export const CurrentSelectionTagList = (props: CurrentSelectionTagListProps) => {

  const { bodies } = props.annotation;

  const anno = useAnnotoriousManifold()

  const { getEntityType } = useDataModel();

  const tags = bodies.filter(b => b.purpose === 'classifying') as unknown as W3CAnnotationBody[];

  const onDeleteBody = (body: W3CAnnotationBody) =>
    anno.deleteBody(body as unknown as AnnotationBody);

  return (
    <ul className="flex flex-wrap py-1 pl-1 mb-4 items-center">
      {tags.map(body => body.purpose === 'classifying' ? (
        <li key={body.id} className="inline-block mr-1 whitespace-nowrap">
          <EntityBadge 
            entityType={getEntityType(body.source)} 
            onDelete={() => onDeleteBody(body)}/>
        </li>
      ) : null)}

      <li>
        <Button 
          variant="ghost" 
          className="text-xs px-1.5 py-3.5 h-6 font-normal rounded-full whitespace-nowrap -ml-0.5"
          onClick={props.onAddTag}>
          <PlusCircle className="h-4 w-4 mr-1" /> Add Tag
        </Button>
      </li>
    </ul>
  )

}