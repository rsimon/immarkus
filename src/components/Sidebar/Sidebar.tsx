import { Link, useLocation } from 'react-router-dom';

import './Sidebar.css';

export const Sidebar = () => {

  const { pathname } = useLocation();

  // I mean how TF is this better than having a decent stylesheet!?? 
  const active = 
    "rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"; 

  return (
    <aside className="main-nav">
      <nav>
        <ul>
          <li>
           <Link 
              className={pathname === '/images' ? active : undefined} 
              to="/images">
                Images
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/vocabularies' ? active : undefined} 
              to="/vocabularies">
                Vocabularies
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/export' ? active : undefined} 
              to="/export">
                Export
            </Link>
          </li>

          <li>
            <Link 
              className={pathname === '/markus' ? active : undefined} 
              to="/markus">
                MARKUS
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )

}

