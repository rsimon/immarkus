import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { exportAnnotations } from './annotations/exportAnnotations';

export const Export = () => {

  const store = useStore();

  const exportStuff = () => {
    exportAnnotations(store);
  }

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page export">
        <h1 className="text-xl font-semibold tracking-tight mb-4">Nothing to see here. (Yet.)</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-6">
          This page is just a placeholder. In the future, we might (for example) offer 
          download options for exporting your data in different formats.
        </p>

        <div className="mt-4">
          <Button onClick={exportStuff}>Export</Button>
        </div>
      </main>
    </div>
  )
}