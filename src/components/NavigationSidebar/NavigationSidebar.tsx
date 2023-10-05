import { Link, useLocation } from 'react-router-dom';
import { Blocks, Download, Globe2, Image, Sparkles } from 'lucide-react';

import './NavigationSidebar.css';

export const NavigationSidebar = () => {

  const { pathname } = useLocation();

  const active = 
    `rounded-md text-sm font-medium ring-offset-background transition-colors 
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
     focus-visible:ring-offset-2 bg-primary text-primary-foreground 
     hover:bg-primary/90 h-10 px-4 py-2`; 

  return (
    <aside className="main-nav">
      <h1 className="text-imarkus font-semibold text-lg mb-6 mt-1 ml-3">
        I-MARKUS
      </h1>

      <nav>
        <ul>
          <li>
           <Link 
              className={pathname === '/images' ? active : undefined} 
              to="/images">
              <Image size={18} className="mr-2" /> Images
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/vocabularies' ? active : undefined} 
              to="/vocabularies">
              <Sparkles size={18} className="mr-2" />  Vocabularies
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/knowledge-graph' ? active : undefined} 
              to="/knowledge-graph">
              <Globe2 size={18} className="mr-2" />  Knowledge Graph
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/export' ? active : undefined} 
              to="/export">
              <Download size={18} className="mr-2 relative -top-0.5" /> Export
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/markus' ? active : undefined} 
              to="/markus">
              <Blocks size={18} className="mr-2 relative -top-0.5" /> MARKUS
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )

}

