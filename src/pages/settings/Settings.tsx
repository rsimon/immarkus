import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { NavTabItem } from '@/components/NavTabItem';
import { Separator } from '@/ui/Separator';
import { General } from './general';
import { VisualSearch } from './visualsearch';

interface SettingsProps {
  
  tab: 'general' | 'visual-search';

}

export const Settings = (props: SettingsProps) => {

  return (
    <>
      <AppNavigationSidebar />

      <main className="grow page export px-12 py-6 overflow-auto">
        <div>
          <h1 className="text-xl font-semibold tracking-tight mb-2">
            Settings
          </h1>

          <p className="mt-1 text-sm leading-6">
            Application-wide settings and configuration.
          </p>
          
          <Separator className="mt-7 w-full mb-2" /> 
        </div>

        <div className="flex">
          <aside className="py-4">
            <nav className="w-44">
              <ol>
                <NavTabItem 
                  path="/settings/general" 
                  label="General" 
                  active={props.tab === 'general'} />

                <NavTabItem 
                  path="/settings/visual-search" 
                  label="Visual Search" 
                  active={props.tab === 'visual-search'} />
              </ol>
            </nav>
          </aside>

          <section className="pl-12 py-0.5 grow">
            {props.tab === 'general' ? (
              <General />
            ) : (
              <VisualSearch />   
            )}
          </section>
        </div>
      </main>
    </>
  )

}