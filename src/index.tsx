import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { DatabaseProvider } from './db';
import { App } from '@/App.tsx';

import './index.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <DatabaseProvider>
    <HashRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </HashRouter>
  </DatabaseProvider>
)
