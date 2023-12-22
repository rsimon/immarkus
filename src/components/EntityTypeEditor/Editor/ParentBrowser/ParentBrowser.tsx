import { Input } from '@/ui/Input';

interface ParentBrowserProps {

  id: string;

  className?: string;

  value?: string;

  onChange(value: string): void;

}

export const ParentBrowser = (props: ParentBrowserProps) => {

  return (
    <Input
      id={props.id}
      className={`${props.className || ''} h-9`.trim()}
      value={props.value || ''}
      onChange={evt => props.onChange(evt.target.value)} />
  )

}