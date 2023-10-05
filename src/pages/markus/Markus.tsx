import { NavigationSidebar } from '@/components/NavigationSidebar';
import { useStore } from '@/store';

export const Markus = () => {

  // Just put this here so we redirect if the store isn't loaded
  useStore({ redirect: true });

  return (
    <div className="page-root">
      <NavigationSidebar />

      <main className="page markus">
        <h1 className="text-xl font-semibold tracking-tight mb-4">Nothing to see here. (Yet.)</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-6">
          This page is just a placeholder. In the future we will probably need
          functionality to interface with the wider MARKUS infrastructure here.
        </p>
      </main>
    </div>
  )
}