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

  return authority && authority.type === 'IFRAME' && (
    <IFrameAuthorityDialog authority={authority}>
      <button className="text-xs flex items-center hover:bg-slate-200 px-1.5 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0">
        <Search className="h-3.5 w-3.5 mr-1" />
        {props.definition.authorities[0].name}
      </button>
    </IFrameAuthorityDialog>
  )

}