import { Routes, Route, Outlet, Link, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useCollection } from '@/store';

import './App.css';
import { Start } from './pages/start/Start';

export const App = () => {

  const collection = useCollection();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={collection.isLoaded ? '/images' : '/start' }/>} />

        <Route path="start" element={<Start />} />

        {/* image list + image import 
        <Route path="images" element={<Images />} />
        
        {/* image annotation view 
        <Route path="annotate/:id" element={<Annotate />} />

        {/* TODO vocabulary management 
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

const Layout = () => {

  return (
    <div className="app-container">
      <Sidebar />  
      <Outlet />
    </div>
  );
}

const NotFound = () => {

  return (
    <div>
      <h2>Nothing to see here.</h2>
      <p>
        <Link to="/">Back</Link>
      </p>
    </div>
  )

}