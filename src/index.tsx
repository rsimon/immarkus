import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { Toaster } from '@/ui/Toaster';
import { App } from '@/App';
import { RuntimeConfig } from './RuntimeConfig';

import './index.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <RuntimeConfig>
    <StoreProvider>
      <HashRouter>       
        <Toaster />
        <App />
      </HashRouter>
    </StoreProvider>
  </RuntimeConfig>
);