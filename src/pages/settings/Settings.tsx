import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { VisualSearch } from './visualsearch';
import { Separator } from '@/ui/Separator';

export const Settings = () => {

  return (
    <>
      <AppNavigationSidebar />

      <main className="grow page export px-12 py-6 overflow-auto max-w-xl ">
        <h1 className="text-xl font-semibold tracking-tight mb-2">
          Settings
        </h1>
        
        <Separator className="mt-7 w-full mb-2" />

        <VisualSearch />    
      </main>
    </>
  )

}