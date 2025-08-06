import { Button } from '@/ui/Button';
import { AnnotationBody, ImageAnnotation } from '@annotorious/react';
import { usePluginManifold } from '@annotorious/react-manifold';
import { Combine, Subtract } from './Icons';
import { mountPlugin } from '@annotorious/plugin-boolean-operations';
import { Columns3, Cuboid, Trash2 } from 'lucide-react';
import { CompareDialog } from './Compare/CompareDialog';
import { ReactNode, useState } from 'react';
import { MultiSelectionThumbnails } from './MultiSelectionThumbnails';

interface MultiSelectionOptionsProps {

  selected: ImageAnnotation[];

  onAddTag(): void;

  onDeleteSelected(): void;

}

export const MultiSelectionTools = (props: MultiSelectionOptionsProps) => {

  const [showCompareDialog, setShowCompareDialog] = useState(false);

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

  const renderButton = (
    title: string, 
    hint: string, 
    icon: ReactNode, 
    onClick: () => void,
    disabled?: boolean
  ) => (
    <Button
      disabled={disabled}
      variant="outline"
      className="border-transparent hover:border-input flex-col gap-2 h-auto px-3 py-3.5 w-full justify-start text-left items-start focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
      onClick={onClick}
      onKeyDown={evt => evt.stopPropagation()}>
      <div className="flex gap-2 items-center">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>

      <p className="text-xs text-muted-foreground font-normal leading-relaxed">
        {hint}
      </p>
    </Button>
  )
  
  return (
    <div className="p-1 min-h-full flex flex-col justify-between space-y-8">
      <div>
        <MultiSelectionThumbnails selected={props.selected} />

        <div className="space-y-4">
          {renderButton(
            'Compare', 'View selected annotations side by side.',
            <Columns3 className="size-5" />,
            () => setShowCompareDialog(true)
          )}

          {renderButton(
            'Add Tag', 'Apply the same tag to all selected annotations.',
            <Cuboid className="size-5" />,
            props.onAddTag
          )}

          {renderButton(
            'Merge', 'Combine selected annotations. Preserves all tags and concatenates notes in the order of selection.',
            <Combine className="size-5" />,
            onMergeSelected
          )}

          {renderButton(
            'Subtract', 
            'Keep first annotation, delete all others. Overlapping areas are removed from the first annotation.',
            <Subtract className="size-5" />,
            () => plugin.subtractSelected(),
            !canSubtract
          )}
        </div>

        <CompareDialog 
          open={showCompareDialog} 
          selected={props.selected}
          onClose={() => setShowCompareDialog(false)} />
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