import { Button } from '@/ui/Button';
import { AnnotationBody, ImageAnnotation } from '@annotorious/react';
import { usePluginManifold } from '@annotorious/react-manifold';
import { Combine, Subtract } from './Icons';
import { mountPlugin } from '@annotorious/plugin-boolean-operations';
import { Cuboid, Trash2 } from 'lucide-react';

interface MultiSelectionOptionsProps {

  selected: ImageAnnotation[];

  onAddTag(): void;

  onDeleteSelected(): void;

  onKeyDown(evt: React.KeyboardEvent): void;
}

export const MultiSelectionTools = (props: MultiSelectionOptionsProps) => {

  const plugin = usePluginManifold<ReturnType<typeof mountPlugin>>('boolean');

  const canSubtract = plugin.canSubtractSelected().some(Boolean);

  const onMergeSelected = () => {
    const mergeBodies = (selected: ImageAnnotation[]) => 
      selected.reduce<AnnotationBody[]>((all, annotation) => {
        const comments = annotation.bodies.filter(b => (!b.purpose || b.purpose === 'commenting') && b.value);
        const other = annotation.bodies.filter(b => b.purpose && b.purpose !== 'commenting');

        if (comments.length > 0) {
          const value = comments.map(b => b.value!).join(' ');

          // Merge comments
          const currentMerged = all.find(b => b.purpose === 'commenting' && b.value);
          if (currentMerged) {
            // Merge with existing merged comment 
            return [
              ...all.map(b => b.purpose === 'commenting' ? {
                ...b,
                value: `${b.value || ''} ${value}`
              } : b),
              ...other
            ]
          } else {
            // Append value as new comment body
            return [...all, ...other, {
              ...comments[0],
              value
            }]
          }
        } else {
          // Just append other bodies
          return [...all, ...other];
        }
      }, []);

    plugin.mergeSelected({ bodies: mergeBodies });
  }
  
  return (
    <div className="p-2 flex flex-col gap-12">
      <div className="flex flex-col">
        <Button
          autoFocus
          onClick={props.onAddTag}
          onKeyDown={props.onKeyDown}
          className="flex gap-2 px-3 mr-2 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Cuboid className="size-5" /> Add Tag
        </Button>

        <p className="py-4 px-0.5 leading-relaxed text-muted-foreground text-xs">
          Add the same Entity Class tag to all selected annotations.
        </p>
      </div>

      <div className="flex flex-col">
        <Button 
          className="flex gap-2"
          variant="outline"
          onClick={onMergeSelected}>
          <Combine className="size-5" /> Merge selected shapes
        </Button>

        <p className="py-4 px-0.5 leading-relaxed text-muted-foreground text-xs">
          Combine selected shapes into a single union. Only data associated with 
          the first selected shape is preserved. Data from other selections 
          will be lost.
        </p>
      </div>

      <div className="flex flex-col">
        <Button 
          disabled={!canSubtract}
          className="flex gap-2"
          variant="outline"
          onClick={() => plugin.subtractSelected()}>
          <Subtract className="size-5" /> Subtract
        </Button>

        <p className="py-4 px-0.5 leading-relaxed text-muted-foreground text-xs">
          Remove the area of the second shape from the first shape. Data 
          from the first selected shape is preserved. The second shape will
          be deleted.
        </p>
      </div>

      <Button 
        className="flex gap-2"
        variant="destructive"
        onClick={props.onDeleteSelected}>
        <Trash2 className="size-5" /> Delete Selected
      </Button>
    </div>
  )

}