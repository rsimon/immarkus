import { Separator } from '@/ui/Separator';

interface TranslationProps {

  translation: string;

}

export const Translation = (props: TranslationProps) => {

  return (
    <div>
      <div className="p-2 text-muted-foreground/80 text-xs leading-relaxed">
        {props.translation}
      </div>

      <Separator className="mb-1" />
    </div>
  )

}
