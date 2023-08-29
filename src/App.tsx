import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useCollection } from '@/store';
import { Images, Start } from './pages';

import './App.css';

export const App = () => {

  const collection = useCollection();

  return (
    <Routes>
      <Route path="/">
        <Route index element={<Navigate to={collection ? '/images' : '/start' }/>} />

        <Route path="start" element={<Start />} />

        <Route path="images" element={<Images />} />

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