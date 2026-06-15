import { LayoutGrid, Rows3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OverviewLayout } from '../../Types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger 
} from '@/ui/Select';

interface ToggleLayoutProps {

  layout: OverviewLayout;

  onSetLayout(layout: OverviewLayout): void;

}

export const ToggleLayout = (props: ToggleLayoutProps) => {

  const { t } = useTranslation('images');

  return (
    <Select 
      value={props.layout}
      onValueChange={props.onSetLayout}>
      <SelectTrigger
        className="text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 rounded hover:underline underline-offset-4 bg-transparent border-0 shadow-none flex items-center gap-1.5 p-0 h-auto font-normal">
        {props.layout === 'grid' ? (
          <><LayoutGrid className="size-4" /> {t('headerControls.grid')}</>
        ) : (
          <><Rows3 className="size-4" /> {t('headerControls.table')}</>
        )}
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="grid">{t('headerControls.grid')}</SelectItem>
        <SelectItem value="table">{t('headerControls.table')}</SelectItem>
      </SelectContent>
    </Select>
  );

}