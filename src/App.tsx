import { Routes, Route, Navigate } from 'react-router-dom';
import { NavigationSidebar } from './components/NavigationSidebar';
import { Annotate, Export, KnowledgeGraph, Images, Markus, Start, Vocabulary } from './pages';
import { useStore } from './store';

import './App.css';

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

        <Route path="vocabulary" element={<Vocabulary />} />

        <Route path="knowledge-graph" element={<KnowledgeGraph />} />

        <Route path="export" element={<Export />}  />

        <Route path="markus" element={<Markus />} />

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
      <NavigationSidebar />

      <main className="page not-found">
        <h2>Nothing to see here.</h2>
      </main>
    </div>
  )

}