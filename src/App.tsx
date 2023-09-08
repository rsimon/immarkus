import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Annotate, Images, Start, Vocabularies } from './pages';
import { useStore } from './store';

import './App.css';
import { Sidebar } from './components/Sidebar';

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

        {/* TODO data export 
        <Route path="export" element={<Export />}  />

        {/* TODO publish to MARKUS platform 
        <Route path="markus" element={<Markus />} /> /*}

        {/* TODO catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )

}

const NotFound = () => {

  return (
    <div className="page-root">
      <Sidebar />

      <main className="page vocabularies">
        <h2>Nothing to see here. (Yet.)</h2>
      </main>
    </div>
  )

}