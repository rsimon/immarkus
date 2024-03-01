import { Link, useLocation } from 'react-router-dom';
import { Download, Image, Info, Plug, Sparkles, ToyBrick } from 'lucide-react';

import './AppNavigationSidebar.css';

export const AppNavigationSidebar = () => {

  const { pathname } = useLocation();

  const active = 
    `rounded-md text-sm font-medium ring-offset-background transition-colors 
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
     focus-visible:ring-offset-2 bg-primary text-primary-foreground 
     hover:bg-primary/90 h-10 px-4 py-2`; 

  return (
    <aside className="main-nav">
      <h1 className="text-imarkus font-semibold text-lg mb-6 mt-1 ml-3">
        IMMARKUS
      </h1>

      <nav>
        <ul>
          <li>
           <Link 
              className={pathname.startsWith('/images') ? active : undefined} 
              to="/images">
              <Image size={18} className="mr-2" /> Images
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/model' ? active : undefined} 
              to="/model">
              <ToyBrick size={18} className="mr-2" />  Data Model
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/graph' ? active : undefined} 
              to="/graph">
              <Sparkles size={18} className="mr-2" />  Knowledge Graph
            </Link>
          </li>

          <li>
            <Link 
              className={pathname.startsWith('/export') ? active : undefined} 
              to="/export">
              <Download size={18} className="mr-2 relative -top-0.5" /> Export
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/markus' ? active : undefined} 
              to="/markus">
              <Plug size={18} className="mr-2 relative -top-0.5" /> MARKUS
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/about' ? active : undefined} 
              to="/about">
              <Info size={18} className="mr-2 relative -top-[1px]" /> About
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )

}

