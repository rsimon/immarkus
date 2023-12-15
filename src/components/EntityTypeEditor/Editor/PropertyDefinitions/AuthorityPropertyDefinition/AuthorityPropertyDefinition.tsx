import { useRuntimeConfig } from '@/RuntimeConfig';
import { PropertyDefinitionStub } from '../PropertyDefinitionStub';

interface AuthorityPropertyDefinitionProps {

  definition: PropertyDefinitionStub;

}

export const AuthorityPropertyDefinition = (props: AuthorityPropertyDefinitionProps) => {

  const { authorities } = useRuntimeConfig();

  console.log('authorities:', authorities);

  return (
    <div className="bg-muted p-2 mt-3 rounded-md">
    
    </div>
  )

}