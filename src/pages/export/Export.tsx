import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { Separator } from '@/ui/Separator';
import { ExportAnnotations } from './ExportAnnotations';

export const Export = () => {

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page export">
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
                <li className="bg-muted px-3 py-1.5 rounded w-full my-2">Annotations</li>
                <li className="px-3 py-1.5 text-muted-foreground/50">Metadata</li>
                <li className="px-3 py-1.5 text-muted-foreground/50">Images</li>
              </ol>
            </nav>
          </aside>

          <section className="pl-12 py-2 flex-grow">
            <ExportAnnotations />
          </section>
        </div>
      </main>
    </div>
  )
}