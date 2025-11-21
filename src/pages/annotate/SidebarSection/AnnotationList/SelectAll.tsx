import { Button } from '@/ui/Button';

interface SelectAllProps {

  disabled?: boolean;

  onSelectAll(): void;

}

export const SelectAll = (props: SelectAllProps) => {

  return (
    <Button
      disabled={props.disabled}
      className="p-0 font-normal text-xs hover:underline text-muted-foreground bg-transparent h-auto ml-1.5"
      onClick={props.onSelectAll}>
      Select All
    </Button>
  )

}