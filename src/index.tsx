import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { Toaster } from '@/components/Toaster';
import { App } from '@/App';

import './index.css'
import { EntityCard } from './components/EntityCard/EntityCard';

/*
ReactDOM.createRoot(document.getElementById('app')!).render(
  <StoreProvider>
    <HashRouter>       
      <Toaster />
      <App />
    </HashRouter>
  </StoreProvider>
);
*/

ReactDOM.createRoot(document.getElementById('app')!).render(
  <EntityCard />
);