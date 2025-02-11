import { MessageCircle, MessageCircleOff } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/ui/Button';

interface FilterByAnnotationsProps {

  hideUnannotated: boolean;

  onChangeHideUnannotated(hide: boolean): void;

}

export const FilterByAnnotations = (props: FilterByAnnotationsProps) => {

  const { hideUnannotated } = props;

  return (
    <Button
      variant="link"
      className={clsx(hideUnannotated ? 'text-amber-600' : 'text-muted-foreground', 'relative p-0 h-auto font-normal flex items-center gap-1.5')}
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
    </Button> 
  )

}