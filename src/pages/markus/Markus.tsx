import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';

export const Markus = () => {

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page markus px-12 py-6">
        <h1 className="text-xl font-semibold tracking-tight mb-4">Nothing to see here. (Yet.)</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-6">
          This page is just a placeholder. In the future we will probably need
          functionality to interface with the wider MARKUS infrastructure here.
        </p>
      </main>
    </div>
  )
}