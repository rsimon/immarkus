import { Link } from 'react-router-dom';

export const NavTabItem = (props: { path: string, label: string, active?: boolean }) => (
  <li>
    <Link 
      to={props.path}
      className={props.active 
        ? 'block bg-muted px-3 py-1.5 rounded w-full my-2'
        : 'block px-3 py-1.5 rounded w-full my-2'}>{props.label}</Link>
  </li>
)