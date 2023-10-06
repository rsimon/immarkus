import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { Toaster } from '@/ui/Toaster';
import { App } from '@/App';
import { EntityDetails } from '@/components/EntityDetails';
import { AnnotationCommandDialog } from '@/components/AnnotationCommands';

import './index.css'

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
  <EntityDetails />
);

ReactDOM.createRoot(document.getElementById('app')!).render(
  <AnnotationCommandDialog />
);
