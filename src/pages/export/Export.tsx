import { Link } from 'react-router-dom';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { Separator } from '@/ui/Separator';
import { ExportAnnotations } from './ExportAnnotations';
import { ExportDataModel } from './ExportDataModel';
import { ExportMetadata } from './ExportMetadata';
import { ExportRelationships } from './ExportRelationships';

interface ExportProps {
  
  tab: 'annotations' | 'relationships' | 'model' | 'metadata'

}

const NavListItem = (props: { path: string, label: string, active?: boolean }) => (
  <li>
    <Link 
      to={props.path}
      className={props.active 
        ? 'block bg-muted px-3 py-1.5 rounded w-full my-2'
        : 'block px-3 py-1.5 rounded w-full my-2'}>{props.label}</Link>
  </li>
)

export const Export = (props: ExportProps) => {

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page export px-12 py-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight mb-2">Export</h1>

          <p className="mt-1 text-sm leading-6">
            Export your data in different export formats.
          </p>

          <Separator className="mt-7 w-full mb-2" />
        </div>

        <div className="flex flex-row">
          <aside className="py-4">
            <nav className="w-44">
              <ol>
                <NavListItem 
                  path="/export/annotations" 
                  label="Annotations" 
                  active={props.tab === 'annotations'} />

                <NavListItem 
                  path="/export/relationships" 
                  label="Relationships" 
                  active={props.tab === 'relationships'} />

                <NavListItem 
                  path="/export/model" 
                  label="Data Model" 
                  active={props.tab === 'model'} />

                <NavListItem
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
    </div>
  )
}