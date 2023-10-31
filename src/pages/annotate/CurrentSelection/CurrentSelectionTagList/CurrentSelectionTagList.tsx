import { PlusCircle } from 'lucide-react';
import { AnnotationBody, ImageAnnotation, W3CAnnotationBody, useAnnotationStore } from '@annotorious/react';
import { useVocabulary } from '@/store';
import { EntityBadge } from '@/components/EntityBadge';
import { Button } from '@/ui/Button';

interface CurrentSelectionTagListProps {

  annotation: ImageAnnotation;

  onAddTag(): void;

}

export const CurrentSelectionTagList = (props: CurrentSelectionTagListProps) => {

  const { bodies } = props.annotation;

  const store = useAnnotationStore();

  const { getEntity } = useVocabulary();

  const tags: W3CAnnotationBody[] = bodies.filter(b => b.purpose === 'classifying');

  const onDeleteBody = (body: W3CAnnotationBody) =>
    store.deleteBody(body as AnnotationBody);

  return (
    <ul className="flex flex-wrap py-1 pl-1">
      {tags.map(body => body.purpose === 'classifying' ? (
        <li key={body.id} className="inline-block mr-1 mb-1 whitespace-nowrap">
          <EntityBadge 
            entity={getEntity(body.source)} 
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

  /*
  <div className="mt-2 mb-6 p-1 justify-center flex flex-wrap gap-1">
    <span
      className="rounded-full px-2.5 py-1 inline-flex items-center text-xs"
      style={{ 
        backgroundColor: '#ff0000',
        color: '#fff' 
      }}>

      Watchtower
    </span>

    <span
      className="rounded-full pl-2.5 pr-1 py-0.5 inline-flex items-center text-xs"
      style={{ 
        backgroundColor: '#00aa00',
        color: '#fff' 
      }}>

      part of 

      <span 
        style={{ padding: '1px 5px'}}
        className="ml-2 bg-white/60 rounded-lg text-green-700">City Wall</span>
    </span>

    <span
      className="rounded-full pl-2.5 pr-1 py-0.5 inline-flex items-center text-xs"
      style={{ 
        backgroundColor: '#00aa00',
        color: '#fff' 
      }}>

      part of 

      <span 
        style={{ padding: '1px 5px'}}
        className="ml-2 bg-white/60 rounded-lg text-green-700">Gate</span>
    </span>

    <span
      className="rounded-full pl-2 pr-2 py-1 inline-flex items-center text-xs"
      style={{ 
        backgroundColor: '#aaaa00',
        color: '#fff' 
      }}>

      <Tags className="h-4 w-4 mr-1" /> MyTag
    </span>
  </div>

  <div className="border-t">
    <AnnotationCommands />
  </div>
  */

}