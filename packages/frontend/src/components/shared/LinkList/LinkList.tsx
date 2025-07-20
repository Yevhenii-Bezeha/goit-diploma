import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import { ReactNode } from 'react';
import classes from './LinkList.module.css';
import { useSelector } from 'react-redux';
import { isUserOfficeAdminSelector } from '../../../redux/userArtist/userArtistSlice';

type LinkListProps = {
  className?: string;
  items: { title: string; icon: ReactNode; path: string; isOfficeSpecific?: boolean; isAdmin?: boolean }[];
  onItemClick?: () => void;
};

export const LinkList = ({ className, items, onItemClick }: LinkListProps) => {
  const isAdmin = useSelector(isUserOfficeAdminSelector);

  const filteredItems = items.filter((item) => !item.isAdmin || isAdmin);

  return (
    <div className={classnames(classes.container, className)}>
      {filteredItems.map(({ title, icon, path }, index) => (
        <NavLink
          key={index}
          to={path}
          className={({ isActive }) =>
            classnames(classes.item, {
              [classes.active]: isActive,
            })
          }
          onClick={onItemClick}
        >
          {icon}
          <div className="flex items-center">{title}</div>
        </NavLink>
      ))}
    </div>
  );
};
