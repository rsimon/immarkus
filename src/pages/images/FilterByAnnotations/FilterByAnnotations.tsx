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
      className={clsx(hideUnannotated ? 'data-[state=on]:bg-orange-100 data-[state=on]:text-amber-900' : undefined, 'relative py-1 px-1.5 -ml-1 h-auto font-normal flex items-center gap-1.5')}
      onClick={() => props.onChangeHideUnannotated(!hideUnannotated)}>

      {hideUnannotated ? (
        <>
          <MessageCircle className="size-4" /> Show Unannotated
        </>
      ) : (
        <>
          <MessageCircleOff className="size-4" /> Hide Unannotated
        </>
      )}
    </Toggle> 
  )

}