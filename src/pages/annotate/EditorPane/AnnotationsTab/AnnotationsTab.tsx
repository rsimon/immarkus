import { useSelection } from '@annotorious/react';
import { EditorPaneProps } from '..';
import { Textarea } from '@/components/Textarea';

export const AnnotationsTab = (props: EditorPaneProps) => {

  const { selected } = useSelection();

  const empty = selected.length === 0;

  return empty ? (
    <div className="flex bg-muted rounded text-sm justify-center items-center w-full text-muted-foreground">
      No annotation selected
    </div> 
  ) : (
    <div className="w-full">
      <h2 className="text-sm font-medium">
        Comment
      </h2>

      <Textarea 
        className="mt-2 mb-4" 
        rows={6} />

      <h2 className="text-sm font-medium">
        Tags
      </h2>
    </div>
  )

}