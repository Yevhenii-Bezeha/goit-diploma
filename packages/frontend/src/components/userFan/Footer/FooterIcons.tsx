import classes from './Footer.module.css';
import classnames from 'classnames';

interface FooterIconsProps {
  className?: string;
  iconClasses?: string;
  userType?: 'fan' | 'artist';
}

export const FooterIcons = ({ className, iconClasses, userType = 'fan' }: FooterIconsProps) => (
  <div className={classnames(classes.iconList, className)}>
    <div className={classnames(classes.iconItem, iconClasses)}>
      <span className="text-xs text-white/50">Academic Research Project</span>
    </div>
  </div>
);
