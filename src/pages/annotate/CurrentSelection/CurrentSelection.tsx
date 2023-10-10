import { AnnotationCommands } from '@/components/AnnotationCommands';
import { EditorPanelProps } from '../EditorPanel';

export const CurrentSelection = (props: EditorPanelProps) => {

  return (
    <div className="border-t">
      <AnnotationCommands />
    </div>
  )

}