import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { CollectionProvider } from '@/store';
import { DatabaseProvider } from './db';
import { App } from '@/App.tsx';

import './index.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <DatabaseProvider>
    <HashRouter>
      <CollectionProvider>
        <App />
      </CollectionProvider>
    </HashRouter>
  </DatabaseProvider>
)
