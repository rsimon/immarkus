import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Annotate, Export, Graph, Images, Markus, Start, Vocabularies } from './pages';
import { useStore } from './store';

import './App.css';

export const App = () => {

  const store = useStore();
  
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Navigate to={store ? '/images' : '/start' }/>} />

        <Route path="start" element={<Start />} />

        <Route path="images" element={<Images />} />

        <Route path="annotate/:id" element={<Annotate />} />

        <Route path="vocabularies" element={<Vocabularies />} />

        <Route path="graph" element={<Graph />} />

        <Route path="export" element={<Export />}  />

        <Route path="markus" element={<Markus />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )

}

const NotFound = () => {

  return (
    <div className="page-root">
      <Sidebar />

      <main className="page not-found">
        <h2>Nothing to see here. (Yet.)</h2>
      </main>
    </div>
  )

}