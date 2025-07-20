import { NavLink } from 'react-router-dom';
import Pie from '../../../assets/icons/pie.svg';
import Dashboard from '../../../assets/icons/dashboard.svg';
import classes from './NavigationLinks.module.css';
import classnames from 'classnames';
import Cookies from 'js-cookie';

interface NavigationLinksProps {
  onLinkClick?: () => void;
}

const getLinks = () => {
  const hasAccessToken = Cookies.get('mypie_access_token_fan');

  if (!hasAccessToken) {
    return [];
  }

  return [
    {

      to: '/dashboard',
      title: 'Dashboard',
      icon: <Dashboard className="w-6 h-6" />,
      alt: 'dashboard',
    },
    {
      to: '/pie',
      title: 'Pie',
      icon: <Pie className="w-6 h-6" />,
      alt: 'pie',
    },
  ];
};

export const NavigationLinks = ({ onLinkClick }: NavigationLinksProps) => {
  const links = getLinks();

  return (
    <nav className={'flex items-center justify-start sm:justify-center gap-2 py-2 w-full px-4'}>
      {links.map(({ to, title, icon }, index) => (
        <NavLink
          key={index}
          to={to}
          title={title}
          className={({ isActive }) => (isActive ? classnames(classes.link, classes.active) : classes.link)}
          onClick={onLinkClick}
        >
          <div>{icon}</div>
          <span className={'text-xs font-semibold text-white'}>{title}</span>
        </NavLink>
      ))}
    </nav>
  );
};
