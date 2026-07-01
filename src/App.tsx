import { lazy, Suspense } from 'react';
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

const PageLoading = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader2 className="animate-spin size-6 opacity-50" />
  </div>
);

export const App = () => {

  const store = useStore();

  const { pathname } = useLocation();
  
  return store ? (
    <SidebarProvider className="h-dvh">
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/">
            <Route index element={<Navigate to={store ? '/images' : '/start' }/>} />

            <Route path="start" element={<Start />} />

            <Route path="images" element={<Images />} />

            <Route path="images/:folder" element={<Images />} />

            <Route path="annotate/:images?" element={store ? <Annotate /> : <Start />} />

            <Route path="model" element={<Vocabulary />} />

            <Route path="graph" element={<KnowledgeGraph />} />

            <Route path="settings">
              <Route index element={<Navigate to="/settings/general" />} />
              <Route path="general" element={<Settings tab="general" />} />
              <Route path="visual-search" element={<Settings tab="visual-search" />} />
            </Route>

            <Route path="export">
              <Route index element={<Navigate to="/export/annotations" />} />
              <Route path="annotations" element={<Export tab="annotations" />} />
              <Route path="relationships" element={<Export tab="relationships" />} />
              <Route path="model" element={<Export tab="model" />} />
              <Route path="metadata" element={<Export tab="metadata" />} />
            </Route>

            <Route path="markus" element={<Markus />} />

            <Route path="about" element={<About />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </SidebarProvider>
  ) : (
    <Suspense fallback={<PageLoading />}>
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