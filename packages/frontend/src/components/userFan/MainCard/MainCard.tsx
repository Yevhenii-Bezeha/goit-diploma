import { ReactNode } from 'react';
import classnames from 'classnames';
import classes from './MainCard.module.css';

type MainCardProps = {
  src?: string;
  Svg?: React.ElementType;
  name?: string;
  children?: ReactNode;
  description?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
};

export const MainCard = ({
  src,
  name,
  description,
  children,
  className,
  Svg,
  variant = 'default',
}: MainCardProps) => {
  return (
    <div className={classnames(
      classes.container,
      classes[variant],
      className
    )}>
      {/* Visual Element */}
      <div className={classes.visualContainer}>
        {src && <img className={classes.image} src={src} alt={name} />}
        {Svg && <Svg className={classes.svg} />}
      </div>

      {/* Content */}
      <div className={classes.content}>
        {description && (
          <div className={classes.description}>{description}</div>
        )}
        {name && (
          <div className={classes.name}>{name}</div>
        )}
        {children}
      </div>
    </div>
  );
};
