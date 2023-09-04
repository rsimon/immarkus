import { useRef } from 'react';
import { 
  Annotation, 
  AnnotationBody, 
  createBody,
  useAnnotationStore, 
  useSelection 
} from '@annotorious/react';

import './EditorSidebar.css';
import { create } from 'domain';

const getTags = (a: Annotation) => 
  a.bodies.filter(b => b.purpose === 'tagging');

export const EditorSidebar = () => {

  const input = useRef<HTMLInputElement>();

  const { selected } = useSelection();

  const store = useAnnotationStore();

  // TODO how to handle multi-selection in the future?
  const tags = selected.length === 1 ? getTags(selected[0]) : [];

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    const tag = {
      value: input.current.value,
      purpose: 'tagging'
    };

    store.addBody(createBody(selected[0], tag))
  }

  return (
    <aside className="editor-sidebar">
      <ul>
        {tags.map(tag => (
          <li key={tag.id}>
            {tag.value}
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit}>
        <input ref={input} />
      </form>
    </aside>
  )

}