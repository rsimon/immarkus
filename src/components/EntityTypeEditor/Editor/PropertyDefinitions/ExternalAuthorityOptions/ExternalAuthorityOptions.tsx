import { AlertCircle, AlertTriangle } from 'lucide-react';
import { ExternalAuthority } from '@/model/ExternalAuthority';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { Checkbox } from '@/ui/Checkbox';
import { ExternalAuthorityPropertyDefinition } from '@/model';

interface ExternalAuthorityOptionsProps {

  definition: Partial<ExternalAuthorityPropertyDefinition>;

  onUpdate(definition: Partial<ExternalAuthorityPropertyDefinition>): void;

}

export const ExternalAuthorityOptions = (props: ExternalAuthorityOptionsProps) => {

  const { authorities } = useRuntimeConfig();

  const onChange = (authority: ExternalAuthority, checked: boolean) => {
    const next = checked 
      ? { // Add authority 
          ...props.definition,
          authorities: [...(props.definition.authorities || []), authority.name]
        }
      : { // Remove authority
          ...props.definition,
          authorities: (props.definition.authorities || []).filter(a => a !== authority.name)
        };

    props.onUpdate(next);
  }

  const isSelected = (authority: ExternalAuthority) =>
    Boolean((props.definition.authorities || []).find(a => a === authority.name));

  const hasValidConfiguration = (a: ExternalAuthority) =>
    Boolean(a.name) && a.url_pattern?.includes('{{query}}') && a.type === 'IFRAME';

  return (
    <div className="bg-muted px-2 py-3 mt-2 rounded-md text-sm">
      <ol>
        {authorities.map(authority => (
          <li key={authority.name}>
            <div className="relative pl-8 mt-0.5">
              <Checkbox 
                id={authority.name}
                className="absolute top-0.5 left-1.5" 
                checked={isSelected(authority)}
                onCheckedChange={checked => onChange(authority, Boolean(checked))}/> 

              <label 
                htmlFor={authority.name}>

                <span className="flex font-medium items-center">
                  {authority.name}

                  {!hasValidConfiguration(authority) && (
                    <span title="Autority is not configured correctly">
                      <AlertTriangle 
                        className="ml-1 h-4 w-4 text-orange-500" />
                    </span>
                  )}
                </span>

                {authority.description && (
                  <span className="text-black/80 text-xs">
                    {authority.description}
                  </span>
                )}
              </label>
            </div>
          </li>
        ))}
      </ol>

      {(props.definition.authorities || []).length === 0 && (
        <span className="inline-flex ml-1.5 text-xs text-red-600
          font-medium mt-3 mb-1">
          <AlertCircle className="h-3.5 w-3.5 mr-2.5" />  Select at least one authority
        </span>
      )}
    </div>
  )

}