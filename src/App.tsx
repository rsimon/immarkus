import { lazy, ReactNode, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { AppNavigationSidebar } from './components/AppNavigationSidebar';
import { SidebarProvider } from './ui/Sidebar';
import { useStore } from './store';

import './App.css';

const About = lazy(() => import('./pages/about/About').then(m => ({ default: m.About })));
const Annotate = lazy(() => import('./pages/annotate/Annotate').then(m => ({ default: m.Annotate })));
const Export = lazy(() => import('./pages/export/Export').then(m => ({ default: m.Export })));
const KnowledgeGraph = lazy(() => import('./pages/knowledgegraph/KnowledgeGraph').then(m => ({ default: m.KnowledgeGraph })));
const Images = lazy(() => import('./pages/images/Images').then(m => ({ default: m.Images })));
const Markus = lazy(() => import('./pages/markus/Markus').then(m => ({ default: m.Markus })));
const Settings = lazy(() => import('./pages/settings/Settings').then(m => ({ default: m.Settings })));
const Start = lazy(() => import('./pages/start/Start').then(m => ({ default: m.Start })));
const Vocabulary = lazy(() => import('./pages/datamodel/DataModel').then(m => ({ default: m.Vocabulary })));

const FullscreenPageLoading = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader2 className="animate-spin size-6 opacity-50" />
  </div>
);

const SidebarPageLoading = () => (
  <>
    <AppNavigationSidebar />

    <main className="grow flex items-center justify-center">
      <Loader2 className="animate-spin size-6 opacity-50" />
    </main>
  </>
);

// Wraps a lazy page in its own Suspense boundary, keyed per page so that
// navigating between pages always mounts a fresh (unrevealed) boundary and
// shows the loading fallback. A shared boundary around the whole route tree
// doesn't work here: React ties "have I revealed content" to the Suspense
// fiber itself, and Suspense's tree position stays the same across route
// changes, so React reuses it instead of remounting.
// Cf. https://github.com/remix-run/react-router/issues/10568
const withFullscreenFallback = (key: string, element: ReactNode) => (
  <Suspense key={key} fallback={<FullscreenPageLoading />}>
    {element}
  </Suspense>
);

const withSidebarFallback = (key: string, element: ReactNode) => (
  <Suspense key={key} fallback={<SidebarPageLoading />}>
    {element}
  </Suspense>
);

export const App = () => {

  const store = useStore();

  const { pathname } = useLocation();

  return store ? (
    <SidebarProvider className="h-dvh">
      <Routes>
        <Route path="/">
          <Route index element={<Navigate to={store ? '/images' : '/start' }/>} />

          <Route path="start" element={withFullscreenFallback('start', <Start />)} />

          <Route path="images" element={withSidebarFallback('images', <Images />)} />

          <Route path="images/:folder" element={withSidebarFallback('images', <Images />)} />

          <Route path="annotate/:images?" element={withFullscreenFallback('annotate', store ? <Annotate /> : <Start />)} />

          <Route path="model" element={withSidebarFallback('model', <Vocabulary />)} />

          <Route path="graph" element={withSidebarFallback('graph', <KnowledgeGraph />)} />

          <Route path="settings">
            <Route index element={<Navigate to="/settings/general" />} />
            <Route path="general" element={withSidebarFallback('settings', <Settings tab="general" />)} />
            <Route path="visual-search" element={withSidebarFallback('settings', <Settings tab="visual-search" />)} />
          </Route>

          <Route path="export">
            <Route index element={<Navigate to="/export/annotations" />} />
            <Route path="annotations" element={withSidebarFallback('export', <Export tab="annotations" />)} />
            <Route path="relationships" element={withSidebarFallback('export', <Export tab="relationships" />)} />
            <Route path="model" element={withSidebarFallback('export', <Export tab="model" />)} />
            <Route path="metadata" element={withSidebarFallback('export', <Export tab="metadata" />)} />
          </Route>

          <Route path="markus" element={withSidebarFallback('markus', <Markus />)} />

          <Route path="about" element={withSidebarFallback('about', <About />)} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </SidebarProvider>
  ) : (
    <Suspense fallback={<FullscreenPageLoading />}>
      <Start redirectTo={pathname === '/' ? undefined : pathname} />
    </Suspense>
  )

}

const NotFound = () => {

  const { t } = useTranslation('app');

  return (
    <>
      <AppNavigationSidebar />

      <main className="grow page not-found p-8">
        <h2>{t('notFound')}</h2>
      </main>
    </>
  )

}