import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { NavTabItem } from '@/components/NavTabItem';
import { Separator } from '@/ui/Separator';
import { ExportAnnotations } from './ExportAnnotations';
import { ExportDataModel } from './ExportDataModel';
import { ExportMetadata } from './ExportMetadata';
import { ExportRelationships } from './ExportRelationships';

interface ExportProps {
  
  tab: 'annotations' | 'relationships' | 'model' | 'metadata';

}

export const Export = (props: ExportProps) => {

  return (
    <>
      <AppNavigationSidebar />

      <main className="grow page export px-12 py-6 overflow-auto">
        <div>
          <h1 className="text-xl font-semibold tracking-tight mb-2">Export</h1>

          <p className="mt-1 text-sm leading-6">
            Export your data in different export formats.
          </p>

          <Separator className="mt-7 w-full mb-2" />
        </div>

        <div className="flex">
          <aside className="py-4">
            <nav className="w-44">
              <ol>
                <NavTabItem 
                  path="/export/annotations" 
                  label="Annotations" 
                  active={props.tab === 'annotations'} />

                <NavTabItem 
                  path="/export/relationships" 
                  label="Relationships" 
                  active={props.tab === 'relationships'} />

                <NavTabItem 
                  path="/export/model" 
                  label="Data Model" 
                  active={props.tab === 'model'} />

                <NavTabItem
                  path="/export/metadata"
                  label="Metadata"
                  active={props.tab === 'metadata'} />
              </ol>
            </nav>
          </aside>

          <section className="pl-12 py-2 grow">
            {props.tab === 'annotations' ? (
              <ExportAnnotations />
            ) : props.tab === 'relationships' ? (
              <ExportRelationships />
            ) : props.tab === 'model' ? (
              <ExportDataModel />
            ) : props.tab === 'metadata' ? (
              <ExportMetadata />
            ) : null}
          </section>
        </div>
      </main>
    </>
  )
}