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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-0 h-0">
          <defs>
            <linearGradient id="folder-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c2c8d0" />
              <stop offset="100%" stopColor="#a8afbb" />
            </linearGradient>
          </defs>
      </svg>
      </HashRouter>
    </StoreProvider>
  </RuntimeConfig>
);