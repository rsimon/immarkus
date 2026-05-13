import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppNavigationSidebar } from './components/AppNavigationSidebar';
import { SidebarProvider } from './ui/Sidebar';
import { useStore } from './store';
import { 
  About, 
  Annotate, 
  Export, 
  KnowledgeGraph, 
  Images, 
  Markus, 
  Settings,
  Start,
  Vocabulary 
} from './pages';

import './App.css';

export const App = () => {

  const store = useStore();

  const { pathname } = useLocation();
  
  return store ? (
    <SidebarProvider className="h-dvh">
      <Routes>
        <Route path="/">
          <Route index element={<Navigate to={store ? '/images' : '/start' }/>} />

          <Route path="start" element={<Start />} />

          <Route path="images" element={<Images />} />

          <Route path="images/:folder" element={<Images />} />

          <Route path="annotate/:images" element={store ? <Annotate /> : <Start />} />

          <Route path="model" element={<Vocabulary />} />

          <Route path="graph" element={<KnowledgeGraph />} />

          <Route path="settings" element={<Settings />} />

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
    </SidebarProvider>
  ) : (
    <Start redirectTo={pathname === '/' ? undefined : pathname} />
  )

}

const NotFound = () => {

  return (
    <>
      <AppNavigationSidebar />

      <main className="grow page not-found p-8">
        <h2>Nothing to see here.</h2>
      </main>
    </>
  )

}