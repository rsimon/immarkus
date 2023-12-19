import { Search } from 'lucide-react';
import { ExternalAuthorityPropertyDefinition } from '@/model';
import { IFrameAuthorityDialog } from './dialogs';

interface ExternalAuthoritySelectorProps {

  definition: ExternalAuthorityPropertyDefinition;

}

export const ExternalAuthoritySelector = (props: ExternalAuthoritySelectorProps) => {

  // Just for testing
  const authority = props.definition.authorities?.length > 0 
    ? props.definition.authorities[0] : undefined;

  return authority && (
    <div>
      {authority.type === 'IFRAME' && (
        <IFrameAuthorityDialog authority={authority}>
          <button>
            <Search className="h-4 w-4" />
            {props.definition.authorities[0].name}
          </button>
        </IFrameAuthorityDialog>
      )}
    </div>
  );

}