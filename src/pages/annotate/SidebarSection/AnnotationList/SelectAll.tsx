import { Button } from '@/ui/Button';

interface SelectAllProps {

  onSelectAll(): void;

}

export const SelectAll = (props: SelectAllProps) => {

  return (
    <Button
      className="p-0 font-normal text-xs hover:underline text-muted-foreground bg-transparent h-auto ml-1.5"
      onClick={props.onSelectAll}>
      Select All
    </Button>
  )

}