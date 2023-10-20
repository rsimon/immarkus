import { useVocabulary } from '@/store';
import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { BadgeEntity } from './BadgeEntity';

interface CurrentSelectionTagListProps {

  annotation: ImageAnnotation;

}

export const CurrentSelectionTagList = (props: CurrentSelectionTagListProps) => {

  const { bodies } = props.annotation;

  const { vocabulary, getEntity } = useVocabulary();

  const tags: W3CAnnotationBody[] = bodies.filter(b => b.purpose === 'classifying');

  return (
    <ul>
      {tags.map(body => body.purpose === 'classifying' ? (
        <li key={body.id}>
          <BadgeEntity entity={getEntity(body.source)} />
        </li>
      ) : null)}
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