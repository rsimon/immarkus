import { PropertyDefinition } from '@/model';
import { CaseSensitive, Database, Hash, Link2, List, MapPin, Spline } from 'lucide-react';
import { cn } from '@/ui/utils';

interface PropertyTypeIconProps {

  className?: string;

  definition: PropertyDefinition;

}

export const PropertyTypeIcon = (props: PropertyTypeIconProps) => {

  const { type } = props.definition;

  const className = props.className || '';

  return ( 
    <div className="inline">
      {type === 'text' ? (
        <CaseSensitive 
          className={cn('w-4.5 h-5 relative top-[1px]', className)} />
      ) : type === 'number' ? (
        <Hash 
          className={cn('w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'enum' ? (
        <List 
          className={cn('w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'uri' ? (
        <Link2 
          className={cn('w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'geocoordinate' ? (
        <MapPin 
          className={cn('w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'relation' ? (
        <Spline
          className={cn('w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'external_authority' && (
        <Database
          className={cn('w-4.5 h-3.5 -mt-[2px] px-0.5', className)} />
      )}
    </div>
  )

}