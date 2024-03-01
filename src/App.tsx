import { Routes, Route, Navigate } from 'react-router-dom';
import { AppNavigationSidebar } from './components/AppNavigationSidebar';
import { Annotate, Export, KnowledgeGraph, Images, Markus, Start, Vocabulary } from './pages';
import { useStore } from './store';

import './App.css';
import { About } from './pages/about';

export const App = () => {

  const store = useStore();
  
  return store ? (
    <Routes>
      <Route path="/">
        <Route index element={<Navigate to={store ? '/images' : '/start' }/>} />

        <Route path="start" element={<Start />} />

        <Route path="images" element={<Images />} />

        <Route path="images/:folder" element={<Images />} />

        <Route path="annotate/:images" element={store ? <Annotate /> : <Start />} />

        <Route path="model" element={<Vocabulary />} />

        <Route path="graph" element={<KnowledgeGraph />} />

        <Route path="export">
          <Route index element={<Navigate to="/export/model" />} />
          <Route path="model" element={<Export tab="model" />} />
          <Route path="annotations" element={<Export tab="annotations" />} />
          <Route path="metadata" element={<Export tab="metadata" />} />
        </Route>

        <Route path="markus" element={<Markus />} />

        <Route path="about" element={<About />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  ) : (
    <Start />
  )

}

const NotFound = () => {

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page not-found">
        <h2>Nothing to see here.</h2>
      </main>
    </div>
  )

}