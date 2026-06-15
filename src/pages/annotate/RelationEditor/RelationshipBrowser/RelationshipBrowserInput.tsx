import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RenderInputComponentProps } from 'react-autosuggest';

interface RelationshipBrowserInputProps extends RenderInputComponentProps  {

  // For future extensions...

}

export const RelationshipBrowserInput = forwardRef((props: RelationshipBrowserInputProps, ref: React.Ref<HTMLDivElement>) => {

  const { t } = useTranslation('annotate');

  return (
    <div className="flex border-b items-center py-1.5 px-1 text-xs">
      <Search className="w-8 h-4 px-2 text-muted-foreground" />

      <input 
        autoFocus
        {...props}
        placeholder={t('common.searchPlaceholder')}
        className="relative top-[1px] py-1 outline-hidden px-0.5 grow" />
    </div>
  )

});