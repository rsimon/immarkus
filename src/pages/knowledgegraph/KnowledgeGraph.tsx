import { Sidebar } from '@/components/Sidebar';
import { useStore } from '@/store';

export const KnowledgeGraph = () => {

  // Just put this here so we redirect if the store isn't loaded
  useStore({ redirect: true });

  return (
    <div className="page-root">
      <Sidebar />

      <main className="page graph">
        <h1 className="text-xl font-semibold tracking-tight mb-4">Nothing to see here. (Yet.)</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-6">
          This page is just a placeholder. In the future, this might offer an 
          overview of the entire graph - i.e. not the ontology as such, but the annotations and
          their connections with the ontology terms.
        </p>
      </main>
    </div>
  )
}