import clsx from 'clsx';
import { MessageCircle, MessageCircleOff } from 'lucide-react';
import { Toggle } from '@/ui/Toggle';

interface FilterByAnnotationsProps {

  hideUnannotated: boolean;

  onChangeHideUnannotated(hide: boolean): void;

}

export const FilterByAnnotations = (props: FilterByAnnotationsProps) => {

  const { hideUnannotated } = props;

  return (
    <Toggle
      pressed={hideUnannotated}
      className={clsx(hideUnannotated ? 'data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:px-2' : undefined, 'relative py-1 px-1.5 -ml-1 h-auto font-normal flex items-center gap-1.5')}
      onPressedChange={pressed => props.onChangeHideUnannotated(pressed)}>

      {hideUnannotated ? (
        <>
          <MessageCircle className="size-4" /> Show unannotated
        </>
      ) : (
        <>
          <MessageCircleOff className="size-4" /> Hide unannotated
        </>
      )}
    </Toggle> 
  )

}