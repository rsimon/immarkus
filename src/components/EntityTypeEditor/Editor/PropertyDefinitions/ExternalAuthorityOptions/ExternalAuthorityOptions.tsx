import { ExternalAuthority } from '@/model/ExternalAuthority';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { Checkbox } from '@/ui/Checkbox';
import { PropertyDefinitionStub } from '../PropertyDefinitionStub';

interface ExternalAuthorityOptionsProps {

  definition: PropertyDefinitionStub;

  onUpdate(definition: PropertyDefinitionStub): void;

}

export const ExternalAuthorityOptions = (props: ExternalAuthorityOptionsProps) => {

  const { authorities } = useRuntimeConfig();

  const onChange = (authority: ExternalAuthority, checked: boolean) => {
    const next = checked 
      ? { // Add authority 
          ...props.definition,
          authorities: [...(props.definition.authorities || []), authority]
        }
      : { // Remove authority
          ...props.definition,
          authorities: (props.definition.authorities || []).filter(a => a.name !== authority.name)
        };

    props.onUpdate(next);
  }

  const isSelected = (authority: ExternalAuthority) =>
    Boolean((props.definition.authorities || []).find(a => a.name === authority.name));

  return (
    <div className="bg-muted px-2 py-3 mt-2 rounded-md text-sm">
      <ol>
        {authorities.map(authority => (
          <li key={authority.name}>
            <div className="relative pl-8">
              <Checkbox 
                id={authority.name}
                className="absolute top-0.5 left-1.5" 
                checked={isSelected(authority)}
                onCheckedChange={checked => onChange(authority, Boolean(checked))}/> 

              <label 
                htmlFor={authority.name}>

                <span className="block font-medium">
                  {authority.name}
                </span>

                {authority.description && (
                  <span className="text-black/80 text-xs">{authority.description}</span>
                )}
              </label>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )

}