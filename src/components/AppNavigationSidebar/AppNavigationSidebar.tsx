import { Link, useLocation } from 'react-router-dom';
import { Download, HelpCircle, Image, Info, LogOut, Plug, ToyBrick, Waypoints } from 'lucide-react';

import './AppNavigationSidebar.css';

export const AppNavigationSidebar = () => {

  const { pathname } = useLocation();

  const active = 
    `rounded-md text-sm font-medium ring-offset-background transition-colors 
     focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring 
     focus-visible:ring-offset-2 bg-primary text-primary-foreground 
     hover:bg-primary/90 h-10 px-4 py-2`; 

  return (
    <aside className="main-nav flex flex-col justify-between">
      <div>
        <h1 className="text-imarkus font-[Lexend] font-medium text-xl mb-6 mt-1 ml-3">
          <button onClick={() => location.href = '/'}>IMMARKUS</button>
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
                <Waypoints size={18} className="mr-2" />  Knowledge Graph
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
                <Plug size={18} className="mr-2 relative -top-0.5" /> X-MARKUS
              </Link>
            </li>

            <li>
              <Link 
                className={pathname === '/about' ? active : undefined} 
                to="/about">
                <Info size={18} className="mr-2 relative -top-[1px]" /> About
              </Link>
            </li>

            <li>
              <a
                href="https://github.com/rsimon/immarkus/wiki" target="_blank">
                <HelpCircle size={18} className="mr-2 relative -top-[1px]" /> Help
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div>
        <button 
          className="flex items-center p-[10px]"
          onClick={() => location.href = '/'}>
          <LogOut size={18} className="mr-2" /> Exit
        </button>
      </div>
    </aside>
  )

}

