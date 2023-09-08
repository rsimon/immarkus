import { Sidebar } from '@/components/Sidebar';
import { useStore } from '@/store';

export const Export = () => {

  // Just put this here so we redirect if the store isn't loaded
  useStore({ redirect: true });

  return (
    <div className="page-root">
      <Sidebar />

      <main className="page export">
        <h1 className="text-xl font-semibold tracking-tight mb-4">Nothing to see here. (Yet.)</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-6">
          This page is just a placeholder. In the future, we might (for example) offer 
          download options for exporting your data in different formats.
        </p>
      </main>
    </div>
  )
}